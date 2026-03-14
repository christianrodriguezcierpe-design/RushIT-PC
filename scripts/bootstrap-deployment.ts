import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildDeploymentBootstrapMetadata,
  buildDeploymentDecisionsLog,
  buildDeploymentReadme,
  buildDeploymentSessionState,
  normalizeRepoUrl,
} from "../src/features/deployment/deployment-bootstrap";
import { DEFAULT_SITE_THEME_PRESET, listSiteThemePresets } from "../src/features/theme/site-theme";
import type { AddOnId, NotificationProviderId, PackageTier } from "../src/types/site";

const allowedPackageTiers = new Set<PackageTier>(["base", "growth", "premium"]);
const allowedNotificationProviders = new Set<NotificationProviderId>(["postmark", "smtp"]);
const allowedAddOns = new Set<AddOnId>([
  "notifications",
  "pricing",
  "beforeAfterGallery",
  "caseStudies",
  "team",
  "leadMagnet",
  "blogPreview",
]);
const allowedThemePresets = new Set(listSiteThemePresets().map((preset) => preset.id));

type ParsedArgs = {
  targetDir: string;
  deploymentName: string;
  businessName: string;
  repoUrl: string;
  baseProductRepoUrl?: string;
  packageTier: PackageTier;
  themePreset: string;
  notificationProvider: NotificationProviderId;
  addOns: AddOnId[];
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

const getArgValue = (args: string[], flag: string) => {
  const index = args.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
};

const getRepeatedArgValues = (args: string[], flag: string) => {
  const values: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === flag) {
      values.push(args[index + 1] ?? "");
    }
  }

  return values;
};

const getGitOriginUrl = (directory: string) => {
  try {
    return execFileSync("git", ["-C", directory, "config", "--get", "remote.origin.url"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

const ensureRequired = (value: string | undefined, label: string) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error(`Missing required argument ${label}.`);
  }

  return trimmedValue;
};

const parseAddOns = (args: string[]) => {
  const rawValues = getRepeatedArgValues(args, "--add-on")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  const uniqueValues = [...new Set(rawValues)];

  uniqueValues.forEach((value) => {
    if (!allowedAddOns.has(value as AddOnId)) {
      throw new Error(`Unsupported add-on "${value}".`);
    }
  });

  return uniqueValues as AddOnId[];
};

const parseArgs = (): ParsedArgs => {
  const args = process.argv.slice(2);

  const targetDir = path.resolve(getArgValue(args, "--target-dir") ?? process.cwd());
  const deploymentName = ensureRequired(getArgValue(args, "--deployment-name"), "--deployment-name");
  const businessName = ensureRequired(getArgValue(args, "--business-name"), "--business-name");
  const repoUrl = ensureRequired(getArgValue(args, "--repo-url"), "--repo-url");
  const packageTier = (getArgValue(args, "--package-tier") ?? "base").trim() as PackageTier;
  const themePreset = (getArgValue(args, "--theme-preset") ?? DEFAULT_SITE_THEME_PRESET).trim();
  const notificationProvider = (getArgValue(args, "--notification-provider") ?? "postmark").trim() as NotificationProviderId;
  const baseProductRepoUrl = getArgValue(args, "--base-product-repo-url")?.trim();
  const addOns = parseAddOns(args);

  if (!allowedPackageTiers.has(packageTier)) {
    throw new Error(`Unsupported package tier "${packageTier}".`);
  }

  if (!allowedThemePresets.has(themePreset)) {
    throw new Error(`Unsupported theme preset "${themePreset}".`);
  }

  if (!allowedNotificationProviders.has(notificationProvider)) {
    throw new Error(`Unsupported notification provider "${notificationProvider}".`);
  }

  return {
    targetDir,
    deploymentName,
    businessName,
    repoUrl,
    baseProductRepoUrl,
    packageTier,
    themePreset,
    notificationProvider,
    addOns,
  };
};

const assertTargetDirectoryReady = ({
  targetDir,
  repoUrl,
  baseProductRepoUrl,
}: {
  targetDir: string;
  repoUrl: string;
  baseProductRepoUrl: string;
}) => {
  const packageJsonPath = path.join(targetDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    throw new Error(`Target directory "${targetDir}" does not contain package.json.`);
  }

  const targetOriginUrl = getGitOriginUrl(targetDir);

  if (
    path.resolve(targetDir) === repoRoot &&
    (!targetOriginUrl ||
      normalizeRepoUrl(targetOriginUrl) === normalizeRepoUrl(baseProductRepoUrl))
  ) {
    throw new Error(
      "Refusing to bootstrap the base product workspace. Run this command against a deployment workspace or pass --target-dir to a copied repo with its own origin.",
    );
  }

  if (targetOriginUrl && normalizeRepoUrl(targetOriginUrl) !== normalizeRepoUrl(repoUrl)) {
    throw new Error(
      `Target repo origin "${targetOriginUrl}" does not match --repo-url "${repoUrl}". Repoint origin before bootstrapping this workspace.`,
    );
  }
};

const writeJsonFile = async (filePath: string, value: unknown) => {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
};

const maybeUpdatePackageName = async (targetDir: string, deploymentName: string) => {
  const packageJsonPath = path.join(targetDir, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8")) as Record<string, unknown>;
  const nextName =
    deploymentName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "deployment";

  packageJson.name = nextName;

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf-8");

  const packageLockPath = path.join(targetDir, "package-lock.json");

  if (!existsSync(packageLockPath)) {
    return;
  }

  const packageLock = JSON.parse(await readFile(packageLockPath, "utf-8")) as {
    name?: string;
    packages?: Record<string, Record<string, unknown>>;
  };

  packageLock.name = nextName;

  if (packageLock.packages?.[""]) {
    packageLock.packages[""].name = nextName;
  }

  await writeFile(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`, "utf-8");
};

const run = async () => {
  const args = parseArgs();
  const baseProductRepoUrl = args.baseProductRepoUrl ?? getGitOriginUrl(repoRoot);

  if (!baseProductRepoUrl) {
    throw new Error(
      "Unable to resolve the base product repo URL. Pass --base-product-repo-url explicitly.",
    );
  }

  assertTargetDirectoryReady({
    targetDir: args.targetDir,
    repoUrl: args.repoUrl,
    baseProductRepoUrl,
  });

  const metadata = buildDeploymentBootstrapMetadata({
    deploymentName: args.deploymentName,
    businessName: args.businessName,
    repoUrl: args.repoUrl,
    baseProductRepoUrl,
    packageTier: args.packageTier,
    enabledAddOns: args.addOns,
    themePreset: args.themePreset,
    notificationProvider: args.notificationProvider,
    bootstrappedAt: new Date().toISOString(),
  });

  await mkdir(path.join(args.targetDir), { recursive: true });
  await writeFile(path.join(args.targetDir, "README.md"), buildDeploymentReadme(metadata), "utf-8");
  await writeFile(path.join(args.targetDir, "DECISIONS.md"), buildDeploymentDecisionsLog(metadata), "utf-8");
  await writeFile(path.join(args.targetDir, "SESSION_STATE.md"), buildDeploymentSessionState(metadata), "utf-8");
  await writeJsonFile(path.join(args.targetDir, "deployment.config.json"), metadata);
  await maybeUpdatePackageName(args.targetDir, args.deploymentName);

  console.log(`Bootstrapped deployment workspace for ${metadata.businessName}.`);
  console.log(`- Target dir: ${args.targetDir}`);
  console.log(`- Repo URL: ${metadata.repoUrl}`);
  console.log(`- Package tier: ${metadata.packageTier}`);
  console.log(`- Enabled add-ons: ${metadata.enabledAddOns.length > 0 ? metadata.enabledAddOns.join(", ") : "none"}`);
  console.log(`- Theme preset: ${metadata.themePreset}`);
  console.log(`- Notification provider: ${metadata.notificationProvider}`);
};

run().catch((error) => {
  console.error("Failed to bootstrap deployment workspace.", error);
  process.exitCode = 1;
});

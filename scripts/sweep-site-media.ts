import { createClient } from "@supabase/supabase-js";

import {
  SITE_MEDIA_BUCKET,
  collectSiteMediaPaths,
  isManagedStoragePath,
} from "../src/features/media/site-media-paths";
import {
  hydrateSiteDefinition,
  type BusinessProfileRow,
  type DeploymentConfigRow,
  type FixedSectionRow,
  type ManagedSectionRow,
} from "../src/features/site/site-storage";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isDryRun = process.argv.includes("--dry-run");
const MEDIA_PREFIXES = ["before-after-gallery/before", "before-after-gallery/after"];

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase media-sweep env. Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before running site:sweep-media.",
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const listPathsUnderPrefix = async (prefix: string) => {
  const paths: string[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(SITE_MEDIA_BUCKET)
      .list(prefix, { limit, offset, sortBy: { column: "name", order: "asc" } });

    if (error) {
      throw error;
    }

    const filePaths = (data ?? [])
      .filter((item) => Boolean(item.name) && !item.name.endsWith("/"))
      .map((item) => `${prefix}/${item.name}`);

    paths.push(...filePaths);

    if (!data || data.length < limit) {
      break;
    }

    offset += limit;
  }

  return paths;
};

const loadCurrentSiteDefinition = async () => {
  const [businessProfileResult, deploymentConfigResult, fixedSectionsResult, managedSectionsResult] =
    await Promise.all([
      supabase.from("business_profile").select("*").eq("id", "default").maybeSingle(),
      supabase.from("deployment_config").select("*").eq("id", "default").maybeSingle(),
      supabase.from("fixed_section_content").select("*"),
      supabase.from("managed_section_content").select("*").order("order_index", { ascending: true }),
    ]);

  if (businessProfileResult.error) {
    throw businessProfileResult.error;
  }

  if (deploymentConfigResult.error) {
    throw deploymentConfigResult.error;
  }

  if (fixedSectionsResult.error) {
    throw fixedSectionsResult.error;
  }

  if (managedSectionsResult.error) {
    throw managedSectionsResult.error;
  }

  if (
    !businessProfileResult.data ||
    !deploymentConfigResult.data ||
    !fixedSectionsResult.data ||
    !managedSectionsResult.data
  ) {
    throw new Error("The site definition tables are missing required rows. Run site:apply-preset first.");
  }

  return hydrateSiteDefinition({
    businessProfile: businessProfileResult.data as BusinessProfileRow,
    deploymentConfig: deploymentConfigResult.data as DeploymentConfigRow,
    fixedSections: fixedSectionsResult.data as FixedSectionRow[],
    managedSections: managedSectionsResult.data as ManagedSectionRow[],
  });
};

const run = async () => {
  const siteDefinition = await loadCurrentSiteDefinition();
  const referencedPaths = collectSiteMediaPaths(siteDefinition).filter(isManagedStoragePath);
  const referencedPathSet = new Set(referencedPaths);
  const bucketPaths = (
    await Promise.all(MEDIA_PREFIXES.map((prefix) => listPathsUnderPrefix(prefix)))
  ).flat();
  const orphanedPaths = [...new Set(bucketPaths.filter((path) => !referencedPathSet.has(path)))];

  if (orphanedPaths.length === 0) {
    console.log(
      `No orphaned media objects found in ${SITE_MEDIA_BUCKET}. Referenced assets: ${referencedPaths.length}.`,
    );
    return;
  }

  if (isDryRun) {
    console.log(
      `Dry run: ${orphanedPaths.length} orphaned media objects would be removed from ${SITE_MEDIA_BUCKET}.`,
    );
    orphanedPaths.forEach((path) => console.log(` - ${path}`));
    return;
  }

  for (const pathChunk of chunk(orphanedPaths, 100)) {
    const { error } = await supabase.storage.from(SITE_MEDIA_BUCKET).remove(pathChunk);

    if (error) {
      throw error;
    }
  }

  console.log(
    `Removed ${orphanedPaths.length} orphaned media objects from ${SITE_MEDIA_BUCKET}. Referenced assets: ${referencedPaths.length}.`,
  );
};

run().catch((error) => {
  console.error("Failed to sweep site media.", error);
  process.exitCode = 1;
});

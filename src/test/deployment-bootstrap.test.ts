import { describe, expect, it } from "vitest";

import {
  buildDeploymentBootstrapMetadata,
  buildDeploymentDecisionsLog,
  buildDeploymentReadme,
  buildDeploymentSessionState,
  normalizeRepoUrl,
} from "@/features/deployment/deployment-bootstrap";

describe("deployment bootstrap helpers", () => {
  const metadata = buildDeploymentBootstrapMetadata({
    deploymentName: "harbor-service-co",
    businessName: "Harbor Service Co.",
    repoUrl: "https://github.com/example/harbor-service-co.git",
    baseProductRepoUrl: "https://github.com/example/base-product.git",
    packageTier: "base",
    enabledAddOns: ["pricing"],
    themePreset: "bytefix-pro",
    notificationProvider: "postmark",
    bootstrappedAt: "2026-03-13T12:00:00.000Z",
  });

  it("normalizes repo urls for safe comparisons", () => {
    expect(normalizeRepoUrl("https://github.com/example/harbor-service-co.git")).toBe(
      "https://github.com/example/harbor-service-co",
    );
    expect(normalizeRepoUrl("https://github.com/example/harbor-service-co/")).toBe(
      "https://github.com/example/harbor-service-co",
    );
  });

  it("builds deployment metadata with the requested profile", () => {
    expect(metadata).toMatchObject({
      deploymentName: "harbor-service-co",
      businessName: "Harbor Service Co.",
      packageTier: "base",
      enabledAddOns: ["pricing"],
      themePreset: "bytefix-pro",
      notificationProvider: "postmark",
      schemaVersion: 1,
    });
  });

  it("generates deployment README content", () => {
    const readme = buildDeploymentReadme(metadata);

    expect(readme).toContain("# Harbor Service Co.");
    expect(readme).toContain("`pricing`");
    expect(readme).toContain("`bytefix-pro`");
  });

  it("generates deployment decisions and session state content", () => {
    const decisions = buildDeploymentDecisionsLog(metadata);
    const sessionState = buildDeploymentSessionState(metadata);

    expect(decisions).toContain("Initial deployment profile");
    expect(sessionState).toContain("Customize and validate the Harbor Service Co. deployment");
    expect(sessionState).toContain("Notification provider: `postmark`");
  });
});

import type { AddOnId, NotificationProviderId, PackageTier } from "@/types/site";
import {
  DEFAULT_SITE_THEME_PRESET,
  listSiteThemePresets,
  resolveSiteThemePreset,
} from "@/features/theme/site-theme";

export interface DeploymentBootstrapInput {
  deploymentName: string;
  businessName: string;
  repoUrl: string;
  baseProductRepoUrl: string;
  packageTier: PackageTier;
  enabledAddOns: AddOnId[];
  themePreset: string;
  notificationProvider: NotificationProviderId;
  bootstrappedAt: string;
}

export interface DeploymentBootstrapMetadata {
  schemaVersion: 1;
  deploymentName: string;
  businessName: string;
  repoUrl: string;
  baseProductRepoUrl: string;
  packageTier: PackageTier;
  enabledAddOns: AddOnId[];
  themePreset: string;
  notificationProvider: NotificationProviderId;
  bootstrappedAt: string;
}

const themePresetDescriptions = new Map(
  listSiteThemePresets().map((preset) => [preset.id, preset.description]),
);

const formatAddOnList = (enabledAddOns: AddOnId[]) =>
  enabledAddOns.length > 0 ? enabledAddOns.map((addOnId) => `\`${addOnId}\``).join(", ") : "None";

export const normalizeRepoUrl = (value: string) => {
  return value.trim().replace(/\.git$/i, "").replace(/\/+$/g, "").toLowerCase();
};

export const buildDeploymentBootstrapMetadata = (
  input: DeploymentBootstrapInput,
): DeploymentBootstrapMetadata => {
  const resolvedThemePreset = resolveSiteThemePreset(input.themePreset || DEFAULT_SITE_THEME_PRESET);

  return {
    schemaVersion: 1,
    deploymentName: input.deploymentName.trim(),
    businessName: input.businessName.trim(),
    repoUrl: input.repoUrl.trim(),
    baseProductRepoUrl: input.baseProductRepoUrl.trim(),
    packageTier: input.packageTier,
    enabledAddOns: [...input.enabledAddOns],
    themePreset: resolvedThemePreset,
    notificationProvider: input.notificationProvider,
    bootstrappedAt: input.bootstrappedAt,
  };
};

export const buildDeploymentReadme = (metadata: DeploymentBootstrapMetadata) => {
  return `# ${metadata.businessName}

Deployment workspace for \`${metadata.deploymentName}\`, derived from the reusable base product.

## Deployment Profile

- Deployment repo: \`${metadata.repoUrl}\`
- Base product repo: \`${metadata.baseProductRepoUrl}\`
- Package tier: \`${metadata.packageTier}\`
- Enabled add-ons: ${formatAddOnList(metadata.enabledAddOns)}
- Theme preset: \`${metadata.themePreset}\`
- Notification provider: \`${metadata.notificationProvider}\`

## Current Status

This repository starts from the published reusable-product baseline. Business content, deployment env values, and live validation still need to be customized for ${metadata.businessName}.

## Immediate Next Steps

1. Replace the base seed content and preset values with ${metadata.businessName} business content.
2. Configure a dedicated Supabase project and environment values for this deployment.
3. Apply migrations, run \`npm run site:apply-preset\`, then run \`npm run site:preflight\`.
4. Validate admin auth, request workflow, package-gated content, and notifications for this deployment.

## Design Direction

- Theme preset: \`${metadata.themePreset}\`
- Theme intent: ${themePresetDescriptions.get(metadata.themePreset) ?? "Controlled deployment preset."}

## Common Commands

- \`npm run dev\`
- \`npm run lint\`
- \`npm run test\`
- \`npm run build\`
- \`npm run site:apply-preset\`
- \`npm run site:preflight\`
- \`npm run site:sweep-media -- --dry-run\`
`;
};

export const buildDeploymentDecisionsLog = (metadata: DeploymentBootstrapMetadata) => {
  return `# Decisions Log

## ${metadata.bootstrappedAt.slice(0, 10)} - Bootstrap this deployment from the base product
- Context: This repository was created as a deployment-specific workspace derived from the reusable product at \`${metadata.baseProductRepoUrl}\`.
- Decision: Keep this repository focused on ${metadata.businessName} deployment customization and validation. Reusable product architecture changes should still be made upstream in the base product first.
- Consequences: README, session state, and future decisions in this repo are deployment-specific. Base-product decisions remain documented in the upstream product repository.

## ${metadata.bootstrappedAt.slice(0, 10)} - Initial deployment profile
- Context: This deployment needs a clean starting configuration before business-specific content and infrastructure are added.
- Decision: Start ${metadata.businessName} with package tier \`${metadata.packageTier}\`, add-ons ${formatAddOnList(metadata.enabledAddOns)}, theme preset \`${metadata.themePreset}\`, and notification provider \`${metadata.notificationProvider}\`.
- Consequences: Future changes to package shape, theme, or provider should be recorded here as deployment-specific decisions.
`;
};

export const buildDeploymentSessionState = (metadata: DeploymentBootstrapMetadata) => {
  return `# Session State

## Current Objective
Customize and validate the ${metadata.businessName} deployment from the reusable product baseline.

## Last Completed
Bootstrapped this deployment workspace from the base product and replaced the copied product-development docs with deployment-specific state.

## Next Actions
- Replace the base seed content and preset values with ${metadata.businessName} business content.
- Confirm the final theme direction under \`${metadata.themePreset}\`.
- Configure the dedicated Supabase project and deployment env values.
- Run migrations, \`npm run site:apply-preset\`, and \`npm run site:preflight\`.
- Validate admin auth, request flow, package-gated sections, and notifications for this deployment.

## Open Blockers/Risks
- This repo still contains baseline product content until the deployment preset is customized.
- No live Supabase project or provider credentials are configured yet for this deployment.
- Notifications will not work until the selected provider \`${metadata.notificationProvider}\` is configured in env.

## Notes
- Deployment repo: \`${metadata.repoUrl}\`
- Base product repo: \`${metadata.baseProductRepoUrl}\`
- Package tier: \`${metadata.packageTier}\`
- Enabled add-ons: ${formatAddOnList(metadata.enabledAddOns)}
- Theme preset: \`${metadata.themePreset}\`
- Notification provider: \`${metadata.notificationProvider}\`
`;
};

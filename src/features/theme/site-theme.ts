export const DEFAULT_SITE_THEME_PRESET = "bytefix-pro";

export const SITE_THEME_ATTRIBUTE = "data-site-theme";

export interface SiteThemePresetDefinition {
  id: string;
  label: string;
  description: string;
}

export const siteThemePresets = {
  "bytefix-pro": {
    id: "bytefix-pro",
    label: "ByteFix Pro",
    description: "Modern tech-forward styling with electric blue, amber highlights, and geometric display typography.",
  },
  "civic-ledger": {
    id: "civic-ledger",
    label: "Civic Ledger",
    description: "Professional service styling with slate blues, warm copper accents, and editorial typography.",
  },
} satisfies Record<string, SiteThemePresetDefinition>;

export const resolveSiteThemePreset = (themePreset: string) =>
  siteThemePresets[themePreset] ? themePreset : DEFAULT_SITE_THEME_PRESET;

export const listSiteThemePresets = () => Object.values(siteThemePresets);

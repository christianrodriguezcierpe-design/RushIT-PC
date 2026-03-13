import { describe, expect, it } from "vitest";

import {
  DEFAULT_SITE_THEME_PRESET,
  listSiteThemePresets,
  resolveSiteThemePreset,
} from "@/features/theme/site-theme";

describe("site theme presets", () => {
  it("falls back to the default preset when an unknown theme is requested", () => {
    expect(resolveSiteThemePreset("unknown-theme")).toBe(DEFAULT_SITE_THEME_PRESET);
  });

  it("lists the controlled theme presets available for deployments", () => {
    const presets = listSiteThemePresets();

    expect(presets.map((preset) => preset.id)).toEqual(["bytefix-pro", "civic-ledger"]);
  });
});

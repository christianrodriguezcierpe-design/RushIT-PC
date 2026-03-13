import { useEffect } from "react";

import { defaultSiteDefinition } from "@/data/siteSeed";
import { useSiteDefinition } from "@/features/site/use-site-definition";
import {
  DEFAULT_SITE_THEME_PRESET,
  resolveSiteThemePreset,
  SITE_THEME_ATTRIBUTE,
} from "@/features/theme/site-theme";

const SiteThemeController = () => {
  const { data: siteDefinition } = useSiteDefinition();

  const themePreset = resolveSiteThemePreset(
    siteDefinition?.packageConfig.themePreset ?? defaultSiteDefinition.packageConfig.themePreset ?? DEFAULT_SITE_THEME_PRESET,
  );

  useEffect(() => {
    document.documentElement.setAttribute(SITE_THEME_ATTRIBUTE, themePreset);
  }, [themePreset]);

  return null;
};

export default SiteThemeController;

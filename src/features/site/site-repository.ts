import { defaultSiteDefinition } from "@/data/siteSeed";
import { getSupabaseBrowserClient } from "@/integrations/supabase/client";
import {
  hydrateSiteDefinition,
  normalizeSiteDefinition,
  type BusinessProfileRow,
  type DeploymentConfigRow,
  type FixedSectionRow,
  type ManagedSectionRow,
} from "@/features/site/site-storage";
import type { BusinessProfile, ManagedSectionKey, SiteDefinition } from "@/types/site";

const LOCAL_SITE_STORAGE_KEY = "service-biz:site-definition";

const cloneSiteDefinition = (): SiteDefinition => {
  return JSON.parse(JSON.stringify(defaultSiteDefinition)) as SiteDefinition;
};

const isBrowser = () => typeof window !== "undefined";

const readLocalSiteDefinition = (): SiteDefinition | null => {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(LOCAL_SITE_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeSiteDefinition(JSON.parse(rawValue) as SiteDefinition);
  } catch {
    return null;
  }
};

const writeLocalSiteDefinition = (siteDefinition: SiteDefinition) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(LOCAL_SITE_STORAGE_KEY, JSON.stringify(siteDefinition));
};

const loadSiteDefinitionFromSupabase = async (): Promise<SiteDefinition | null> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const [businessProfileResult, deploymentConfigResult, fixedSectionsResult, managedSectionsResult] = await Promise.all([
    supabase.from("business_profile").select("*").eq("id", "default").maybeSingle(),
    supabase.from("deployment_config").select("*").eq("id", "default").maybeSingle(),
    supabase.from("fixed_section_content").select("*"),
    supabase.from("managed_section_content").select("*").order("order_index", { ascending: true }),
  ]);

  if (
    businessProfileResult.error ||
    deploymentConfigResult.error ||
    fixedSectionsResult.error ||
    managedSectionsResult.error ||
    !businessProfileResult.data ||
    !deploymentConfigResult.data ||
    !fixedSectionsResult.data ||
    !managedSectionsResult.data
  ) {
    return null;
  }

  return hydrateSiteDefinition(
    {
      businessProfile: businessProfileResult.data as BusinessProfileRow,
      deploymentConfig: deploymentConfigResult.data as DeploymentConfigRow,
      fixedSections: fixedSectionsResult.data as FixedSectionRow[],
      managedSections: managedSectionsResult.data as ManagedSectionRow[],
    },
    cloneSiteDefinition(),
  );
};

export const loadSiteDefinition = async (): Promise<SiteDefinition> => {
  const siteDefinitionFromSupabase = await loadSiteDefinitionFromSupabase();

  if (siteDefinitionFromSupabase) {
    return siteDefinitionFromSupabase;
  }

  return readLocalSiteDefinition() ?? cloneSiteDefinition();
};

export const updateBusinessProfile = async (businessProfile: BusinessProfile): Promise<SiteDefinition> => {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { error } = await supabase
      .from("business_profile")
      .update({
        name: businessProfile.name,
        tagline: businessProfile.tagline,
        logo_icon: businessProfile.logoIcon,
        phone_label: businessProfile.phoneLabel,
        phone_href: businessProfile.phoneHref,
        email: businessProfile.email,
        address_lines: businessProfile.addressLines,
        hours: businessProfile.hours,
      })
      .eq("id", "default");

    if (error) {
      throw error;
    }

    return loadSiteDefinition();
  }

  const nextSiteDefinition = {
    ...(readLocalSiteDefinition() ?? cloneSiteDefinition()),
    business: businessProfile,
  } satisfies SiteDefinition;

  writeLocalSiteDefinition(nextSiteDefinition);
  return nextSiteDefinition;
};

export const updateManagedSectionContent = async <K extends ManagedSectionKey>(
  sectionKey: K,
  content: SiteDefinition["landing"]["managedContent"][K],
): Promise<SiteDefinition> => {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { error } = await supabase
      .from("managed_section_content")
      .update({ content })
      .eq("section_key", sectionKey);

    if (error) {
      throw error;
    }

    return loadSiteDefinition();
  }

  const currentSiteDefinition = readLocalSiteDefinition() ?? cloneSiteDefinition();
  const nextSiteDefinition = {
    ...currentSiteDefinition,
    landing: {
      ...currentSiteDefinition.landing,
      managedContent: {
        ...currentSiteDefinition.landing.managedContent,
        [sectionKey]: content,
      },
    },
  } satisfies SiteDefinition;

  writeLocalSiteDefinition(nextSiteDefinition);
  return nextSiteDefinition;
};

export const reorderManagedSections = async (sectionKeysInOrder: ManagedSectionKey[]): Promise<SiteDefinition> => {
  const supabase = getSupabaseBrowserClient();
  const currentSiteDefinition = (await loadSiteDefinition()) as SiteDefinition;
  const sectionOrderMap = new Map(sectionKeysInOrder.map((sectionKey, index) => [sectionKey, (index + 1) * 10]));
  const reorderedSections = currentSiteDefinition.landing.managedSections
    .map((section) => ({
      ...section,
      order: sectionOrderMap.get(section.key) ?? section.order,
    }))
    .sort((left, right) => left.order - right.order);

  if (supabase) {
    const updateResults = await Promise.all(
      reorderedSections.map((section) =>
        supabase
          .from("managed_section_content")
          .update({ order_index: section.order })
          .eq("section_key", section.key),
      ),
    );

    const failedUpdate = updateResults.find((result) => result.error);

    if (failedUpdate?.error) {
      throw failedUpdate.error;
    }

    return loadSiteDefinition();
  }

  const nextSiteDefinition = {
    ...currentSiteDefinition,
    landing: {
      ...currentSiteDefinition.landing,
      managedSections: reorderedSections,
    },
  } satisfies SiteDefinition;

  writeLocalSiteDefinition(nextSiteDefinition);
  return nextSiteDefinition;
};

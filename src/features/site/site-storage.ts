import { defaultSiteDefinition } from "@/data/siteSeed";
import { createBeforeAfterPlaceholderImage } from "@/features/media/before-after-placeholders";
import type {
  AddOnId,
  BeforeAfterSectionContent,
  FixedSectionConfig,
  FixedSectionKey,
  ImageAsset,
  ManagedSectionConfig,
  ManagedSectionKey,
  NotificationProviderId,
  SiteDefinition,
} from "@/types/site";

export interface BusinessProfileRow {
  id: "default";
  name: string;
  tagline: string;
  logo_icon: SiteDefinition["business"]["logoIcon"];
  phone_label: string;
  phone_href: string;
  email: string;
  address_lines: SiteDefinition["business"]["addressLines"];
  hours: SiteDefinition["business"]["hours"];
}

export interface DeploymentConfigRow {
  id: "default";
  package_tier: SiteDefinition["packageConfig"]["tier"];
  theme_preset: string;
  notification_provider?: NotificationProviderId | null;
  enabled_add_ons: AddOnId[];
  allowed_managed_sections: ManagedSectionKey[];
  locked_fixed_sections: FixedSectionKey[];
  can_reorder_managed_sections: boolean;
  can_reorder_collection_items: boolean;
  allowed_collections: string[];
}

export interface FixedSectionRow {
  section_key: FixedSectionKey;
  enabled: boolean;
  locked_position: FixedSectionConfig["lockedPosition"];
  content: SiteDefinition["landing"]["fixedContent"][FixedSectionKey];
}

export interface ManagedSectionRow {
  section_key: ManagedSectionKey;
  enabled: boolean;
  order_index: number;
  admin_reorderable: boolean;
  add_on_id: AddOnId | null;
  content: SiteDefinition["landing"]["managedContent"][ManagedSectionKey];
}

export interface SiteRecordPayload {
  businessProfile: BusinessProfileRow;
  deploymentConfig: DeploymentConfigRow;
  fixedSections: FixedSectionRow[];
  managedSections: ManagedSectionRow[];
}

type LegacyBeforeAfterItem = {
  label: string;
  order: number;
  before?: string;
  after?: string;
  beforeImage?: Partial<ImageAsset>;
  afterImage?: Partial<ImageAsset>;
};

type LegacyBeforeAfterSectionContent = {
  title: string;
  description: string;
  items: LegacyBeforeAfterItem[];
};

const clone = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};

const toPathSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

const isValidImageAsset = (value: Partial<ImageAsset> | undefined): value is ImageAsset =>
  Boolean(value?.url && value?.path && typeof value.alt === "string");

const normalizeNotificationProvider = (value: unknown): NotificationProviderId =>
  value === "smtp" ? "smtp" : "postmark";

export const normalizeBeforeAfterContent = (
  content: LegacyBeforeAfterSectionContent,
): BeforeAfterSectionContent => ({
  title: content.title,
  description: content.description,
  items: content.items.map((item, index) => {
    const pathId = `${toPathSegment(item.label || `item-${index + 1}`)}-${index + 1}`;
    const beforeAlt = item.beforeImage?.alt?.trim() || item.before?.trim() || `${item.label} before image`;
    const afterAlt = item.afterImage?.alt?.trim() || item.after?.trim() || `${item.label} after image`;

    return {
      label: item.label,
      order: item.order,
      beforeImage: isValidImageAsset(item.beforeImage)
        ? {
            ...item.beforeImage,
            alt: item.beforeImage.alt.trim() || beforeAlt,
          }
        : createBeforeAfterPlaceholderImage({
            side: "before",
            label: item.before?.trim() || item.label,
            alt: beforeAlt,
            pathId,
          }),
      afterImage: isValidImageAsset(item.afterImage)
        ? {
            ...item.afterImage,
            alt: item.afterImage.alt.trim() || afterAlt,
          }
        : createBeforeAfterPlaceholderImage({
            side: "after",
            label: item.after?.trim() || item.label,
            alt: afterAlt,
            pathId,
          }),
    };
  }),
});

export const normalizeSiteDefinition = (site: SiteDefinition): SiteDefinition => ({
  ...site,
  packageConfig: {
    ...site.packageConfig,
    notificationProvider: normalizeNotificationProvider(
      (site.packageConfig as Partial<SiteDefinition["packageConfig"]>).notificationProvider,
    ),
  },
  landing: {
    ...site.landing,
    managedContent: {
      ...site.landing.managedContent,
      beforeAfterGallery: normalizeBeforeAfterContent(
        site.landing.managedContent.beforeAfterGallery as LegacyBeforeAfterSectionContent,
      ),
    },
  },
});

const getFallbackFixedSection = (key: FixedSectionKey) => {
  const section = defaultSiteDefinition.landing.fixedSections.find((item) => item.key === key);

  if (!section) {
    throw new Error(`Missing fallback fixed section config for "${key}".`);
  }

  return clone(section);
};

const getFallbackManagedSection = (key: ManagedSectionKey) => {
  const section = defaultSiteDefinition.landing.managedSections.find((item) => item.key === key);

  if (!section) {
    throw new Error(`Missing fallback managed section config for "${key}".`);
  }

  return clone(section);
};

const getFallbackFixedContent = <K extends FixedSectionKey>(key: K) => {
  return clone(defaultSiteDefinition.landing.fixedContent[key]);
};

const getFallbackManagedContent = <K extends ManagedSectionKey>(key: K) => {
  return clone(defaultSiteDefinition.landing.managedContent[key]);
};

export const buildSiteRecordPayload = (site: SiteDefinition): SiteRecordPayload => {
  const normalizedSite = normalizeSiteDefinition(site);

  return {
    businessProfile: {
      id: "default",
      name: normalizedSite.business.name,
      tagline: normalizedSite.business.tagline,
      logo_icon: normalizedSite.business.logoIcon,
      phone_label: normalizedSite.business.phoneLabel,
      phone_href: normalizedSite.business.phoneHref,
      email: normalizedSite.business.email,
      address_lines: clone(normalizedSite.business.addressLines),
      hours: clone(normalizedSite.business.hours),
    },
    deploymentConfig: {
      id: "default",
      package_tier: normalizedSite.packageConfig.tier,
      theme_preset: normalizedSite.packageConfig.themePreset,
      notification_provider: normalizedSite.packageConfig.notificationProvider,
      enabled_add_ons: clone(normalizedSite.packageConfig.enabledAddOns),
      allowed_managed_sections: clone(normalizedSite.packageConfig.allowedManagedSections),
      locked_fixed_sections: clone(normalizedSite.packageConfig.lockedFixedSections),
      can_reorder_managed_sections: normalizedSite.adminExperience.canReorderManagedSections,
      can_reorder_collection_items: normalizedSite.adminExperience.canReorderCollectionItems,
      allowed_collections: clone(normalizedSite.adminExperience.allowedCollections),
    },
    fixedSections: normalizedSite.landing.fixedSections.map((section) => ({
      section_key: section.key,
      enabled: section.enabled,
      locked_position: section.lockedPosition,
      content: clone(normalizedSite.landing.fixedContent[section.key]),
    })),
    managedSections: normalizedSite.landing.managedSections.map((section) => ({
      section_key: section.key,
      enabled: section.enabled,
      order_index: section.order,
      admin_reorderable: section.adminReorderable,
      add_on_id: section.addOnId ?? null,
      content: clone(normalizedSite.landing.managedContent[section.key]),
    })),
  };
};

export const hydrateSiteDefinition = (
  records: Partial<SiteRecordPayload>,
  fallback: SiteDefinition = defaultSiteDefinition,
): SiteDefinition => {
  const fixedSectionMap = new Map((records.fixedSections ?? []).map((section) => [section.section_key, section]));
  const managedSectionMap = new Map((records.managedSections ?? []).map((section) => [section.section_key, section]));

  return normalizeSiteDefinition({
    business: records.businessProfile
      ? {
          name: records.businessProfile.name,
          tagline: records.businessProfile.tagline,
          logoIcon: records.businessProfile.logo_icon,
          phoneLabel: records.businessProfile.phone_label,
          phoneHref: records.businessProfile.phone_href,
          email: records.businessProfile.email,
          addressLines: clone(records.businessProfile.address_lines),
          hours: clone(records.businessProfile.hours),
        }
      : clone(fallback.business),
    packageConfig: records.deploymentConfig
      ? {
          tier: records.deploymentConfig.package_tier,
          themePreset: records.deploymentConfig.theme_preset,
          notificationProvider: normalizeNotificationProvider(records.deploymentConfig.notification_provider),
          enabledAddOns: clone(records.deploymentConfig.enabled_add_ons),
          allowedManagedSections: clone(records.deploymentConfig.allowed_managed_sections),
          lockedFixedSections: clone(records.deploymentConfig.locked_fixed_sections),
        }
      : clone(fallback.packageConfig),
    adminExperience: records.deploymentConfig
      ? {
          canReorderManagedSections: records.deploymentConfig.can_reorder_managed_sections,
          canReorderCollectionItems: records.deploymentConfig.can_reorder_collection_items,
          allowedCollections: clone(records.deploymentConfig.allowed_collections),
        }
      : clone(fallback.adminExperience),
    landing: {
      fixedSections: fallback.landing.fixedSections.map((section) => {
        const row = fixedSectionMap.get(section.key);

        if (!row) {
          return getFallbackFixedSection(section.key);
        }

        return {
          key: row.section_key,
          enabled: row.enabled,
          lockedPosition: row.locked_position,
        };
      }),
      fixedContent: {
        emergencyBanner: fixedSectionMap.get("emergencyBanner")?.content ?? getFallbackFixedContent("emergencyBanner"),
        navbar: fixedSectionMap.get("navbar")?.content ?? getFallbackFixedContent("navbar"),
        hero: fixedSectionMap.get("hero")?.content ?? getFallbackFixedContent("hero"),
        footer: fixedSectionMap.get("footer")?.content ?? getFallbackFixedContent("footer"),
      },
      managedSections: fallback.landing.managedSections
        .map((section) => {
          const row = managedSectionMap.get(section.key);

          if (!row) {
            return getFallbackManagedSection(section.key);
          }

          return {
            key: row.section_key,
            enabled: row.enabled,
            order: row.order_index,
            adminReorderable: row.admin_reorderable,
            addOnId: row.add_on_id ?? undefined,
          } satisfies ManagedSectionConfig;
        })
        .sort((left, right) => left.order - right.order),
      managedContent: {
        trustBar: managedSectionMap.get("trustBar")?.content ?? getFallbackManagedContent("trustBar"),
        services: managedSectionMap.get("services")?.content ?? getFallbackManagedContent("services"),
        pricing: managedSectionMap.get("pricing")?.content ?? getFallbackManagedContent("pricing"),
        howItWorks: managedSectionMap.get("howItWorks")?.content ?? getFallbackManagedContent("howItWorks"),
        beforeAfterGallery: managedSectionMap.get("beforeAfterGallery")?.content ?? getFallbackManagedContent("beforeAfterGallery"),
        reviews: managedSectionMap.get("reviews")?.content ?? getFallbackManagedContent("reviews"),
        caseStudies: managedSectionMap.get("caseStudies")?.content ?? getFallbackManagedContent("caseStudies"),
        team: managedSectionMap.get("team")?.content ?? getFallbackManagedContent("team"),
        leadMagnet: managedSectionMap.get("leadMagnet")?.content ?? getFallbackManagedContent("leadMagnet"),
        serviceArea: managedSectionMap.get("serviceArea")?.content ?? getFallbackManagedContent("serviceArea"),
        faq: managedSectionMap.get("faq")?.content ?? getFallbackManagedContent("faq"),
        booking: managedSectionMap.get("booking")?.content ?? getFallbackManagedContent("booking"),
        blogPreview: managedSectionMap.get("blogPreview")?.content ?? getFallbackManagedContent("blogPreview"),
      },
    },
  });
};

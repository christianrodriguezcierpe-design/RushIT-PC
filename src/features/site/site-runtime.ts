import type {
  AddOnId,
  FixedSectionKey,
  LinkItem,
  ManagedSectionConfig,
  ManagedSectionKey,
  SiteDefinition,
} from "@/types/site";

const footerLinkMap: Partial<Record<ManagedSectionKey, LinkItem>> = {
  services: { label: "Services", href: "#services" },
  pricing: { label: "Pricing", href: "#pricing" },
  howItWorks: { label: "How It Works", href: "#how-it-works" },
  beforeAfterGallery: { label: "Gallery", href: "#before-after" },
  reviews: { label: "Reviews", href: "#reviews" },
  caseStudies: { label: "Case Studies", href: "#case-studies" },
  team: { label: "Team", href: "#team" },
  leadMagnet: { label: "Free Guide", href: "#lead-magnet" },
  serviceArea: { label: "Service Area", href: "#service-area" },
  faq: { label: "FAQ", href: "#faq" },
  booking: { label: "Book Now", href: "#booking" },
  blogPreview: { label: "Blog", href: "#blog" },
};

export const getFixedSectionConfig = (site: SiteDefinition, key: FixedSectionKey) => {
  return site.landing.fixedSections.find((section) => section.key === key && section.enabled);
};

export const getEnabledManagedSections = (site: SiteDefinition): ManagedSectionConfig[] => {
  return [...site.landing.managedSections]
    .filter((section) => section.enabled && site.packageConfig.allowedManagedSections.includes(section.key))
    .sort((left, right) => left.order - right.order);
};

export const isManagedSectionAllowed = (site: SiteDefinition, key: ManagedSectionKey) => {
  return site.packageConfig.allowedManagedSections.includes(key);
};

export const hasEnabledAddOn = (site: SiteDefinition, addOnId: AddOnId) => {
  return site.packageConfig.enabledAddOns.includes(addOnId);
};

export const getFooterQuickLinks = (site: SiteDefinition): LinkItem[] => {
  return getEnabledManagedSections(site)
    .map((section) => footerLinkMap[section.key])
    .filter((link): link is LinkItem => Boolean(link));
};

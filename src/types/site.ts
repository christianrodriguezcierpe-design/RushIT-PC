export type PackageTier = "base" | "growth" | "premium";

export type NotificationProviderId = "postmark" | "smtp";

export type AddOnId =
  | "notifications"
  | "pricing"
  | "beforeAfterGallery"
  | "caseStudies"
  | "team"
  | "leadMagnet"
  | "blogPreview";

export type SiteIconName =
  | "Award"
  | "Clock"
  | "Cpu"
  | "Database"
  | "Download"
  | "HardDrive"
  | "MessageSquare"
  | "Monitor"
  | "Search"
  | "Settings"
  | "Shield"
  | "Star"
  | "User"
  | "Wifi"
  | "Wrench"
  | "Zap";

export interface LinkItem {
  label: string;
  href: string;
}

export interface ImageAsset {
  url: string;
  path: string;
  alt: string;
}

export interface BusinessHour {
  label: string;
  highlight?: boolean;
}

export interface BusinessProfile {
  name: string;
  tagline: string;
  logoIcon: SiteIconName;
  phoneLabel: string;
  phoneHref: string;
  email: string;
  addressLines: string[];
  hours: BusinessHour[];
}

export interface EmergencyBannerContent {
  message: string;
  callToActionLabel: string;
}

export interface NavbarContent {
  links: LinkItem[];
  callToActionLabel: string;
}

export interface HeroSectionContent {
  badge: string;
  title: string;
  highlightedTitle: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface FooterContent {
  quickLinks: LinkItem[];
  legalText: string;
}

export interface TrustBarSectionContent {
  items: Array<{
    icon: SiteIconName;
    label: string;
    supportingText: string;
    order: number;
  }>;
}

export interface ServicesSectionContent {
  title: string;
  description: string;
  bookLinkLabel: string;
  items: Array<{
    icon: SiteIconName;
    title: string;
    description: string;
    order: number;
  }>;
}

export interface PricingSectionContent {
  title: string;
  description: string;
  popularBadgeLabel: string;
  callToActionLabel: string;
  tiers: Array<{
    name: string;
    priceLabel: string;
    description: string;
    features: string[];
    popular?: boolean;
    order: number;
  }>;
}

export interface HowItWorksSectionContent {
  title: string;
  description: string;
  steps: Array<{
    icon: SiteIconName;
    title: string;
    description: string;
    order: number;
  }>;
}

export interface BeforeAfterSectionContent {
  title: string;
  description: string;
  items: Array<{
    label: string;
    beforeImage: ImageAsset;
    afterImage: ImageAsset;
    order: number;
  }>;
}

export interface ReviewsSectionContent {
  title: string;
  description: string;
  items: Array<{
    name: string;
    text: string;
    rating: number;
    order: number;
  }>;
}

export interface CaseStudiesSectionContent {
  title: string;
  description: string;
  items: Array<{
    title: string;
    problem: string;
    solution: string;
    result: string;
    order: number;
  }>;
}

export interface TeamSectionContent {
  title: string;
  description: string;
  items: Array<{
    name: string;
    role: string;
    bio: string;
    icon: SiteIconName;
    order: number;
  }>;
}

export interface LeadMagnetSectionContent {
  title: string;
  description: string;
  inputPlaceholder: string;
  buttonLabel: string;
  successMessage: string;
  icon: SiteIconName;
}

export interface ServiceAreaSectionContent {
  title: string;
  description: string;
  areasLabel: string;
  areas: Array<{
    label: string;
    order: number;
  }>;
}

export interface FaqSectionContent {
  title: string;
  description: string;
  items: Array<{
    question: string;
    answer: string;
    order: number;
  }>;
}

export interface BookingSectionContent {
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  servicePlaceholder: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  datePlaceholder: string;
  timePlaceholder: string;
  messagePlaceholder: string;
  serviceOptions: Array<{
    value: string;
    label: string;
    order: number;
  }>;
}

export interface BlogPreviewSectionContent {
  title: string;
  description: string;
  readMoreLabel: string;
  posts: Array<{
    title: string;
    excerpt: string;
    publishedAtLabel: string;
    order: number;
  }>;
}

export interface FixedSectionContentMap {
  emergencyBanner: EmergencyBannerContent;
  navbar: NavbarContent;
  hero: HeroSectionContent;
  footer: FooterContent;
}

export interface ManagedSectionContentMap {
  trustBar: TrustBarSectionContent;
  services: ServicesSectionContent;
  pricing: PricingSectionContent;
  howItWorks: HowItWorksSectionContent;
  beforeAfterGallery: BeforeAfterSectionContent;
  reviews: ReviewsSectionContent;
  caseStudies: CaseStudiesSectionContent;
  team: TeamSectionContent;
  leadMagnet: LeadMagnetSectionContent;
  serviceArea: ServiceAreaSectionContent;
  faq: FaqSectionContent;
  booking: BookingSectionContent;
  blogPreview: BlogPreviewSectionContent;
}

export type FixedSectionKey = keyof FixedSectionContentMap;
export type ManagedSectionKey = keyof ManagedSectionContentMap;

export interface FixedSectionConfig<K extends FixedSectionKey = FixedSectionKey> {
  key: K;
  enabled: boolean;
  lockedPosition: "announcement" | "header" | "hero" | "footer";
}

export interface ManagedSectionConfig<K extends ManagedSectionKey = ManagedSectionKey> {
  key: K;
  enabled: boolean;
  order: number;
  adminReorderable: boolean;
  addOnId?: AddOnId;
}

export interface PackageConfig {
  tier: PackageTier;
  themePreset: string;
  notificationProvider: NotificationProviderId;
  enabledAddOns: AddOnId[];
  allowedManagedSections: ManagedSectionKey[];
  lockedFixedSections: FixedSectionKey[];
}

export interface AdminExperienceConfig {
  canReorderManagedSections: boolean;
  canReorderCollectionItems: boolean;
  allowedCollections: string[];
}

export interface SiteDefinition {
  business: BusinessProfile;
  packageConfig: PackageConfig;
  adminExperience: AdminExperienceConfig;
  landing: {
    fixedSections: FixedSectionConfig[];
    fixedContent: FixedSectionContentMap;
    managedSections: ManagedSectionConfig[];
    managedContent: ManagedSectionContentMap;
  };
}

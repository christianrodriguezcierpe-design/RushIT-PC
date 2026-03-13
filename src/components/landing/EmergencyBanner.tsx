import { Phone, Zap } from "lucide-react";

import type { BusinessProfile, EmergencyBannerContent } from "@/types/site";

interface EmergencyBannerProps {
  business: BusinessProfile;
  content: EmergencyBannerContent;
}

const EmergencyBanner = ({ business, content }: EmergencyBannerProps) => (
  <div className="bg-accent px-4 py-2 text-center font-display text-sm font-semibold tracking-wide text-accent-foreground">
    <div className="container flex items-center justify-center gap-2">
      <Zap className="h-4 w-4" />
      <span>{content.message}</span>
      <a href={business.phoneHref} className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80">
        <Phone className="h-3 w-3" /> {content.callToActionLabel}
      </a>
    </div>
  </div>
);

export default EmergencyBanner;

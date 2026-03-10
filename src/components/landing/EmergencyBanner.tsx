import { Phone, Zap } from "lucide-react";

const EmergencyBanner = () => (
  <div className="bg-accent text-accent-foreground py-2 px-4 text-center font-display text-sm font-semibold tracking-wide">
    <div className="container flex items-center justify-center gap-2">
      <Zap className="h-4 w-4" />
      <span>Same-Day PC Repair Available — Call Now!</span>
      <a href="tel:+15551234567" className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80">
        <Phone className="h-3 w-3" /> (555) 123-4567
      </a>
    </div>
  </div>
);

export default EmergencyBanner;

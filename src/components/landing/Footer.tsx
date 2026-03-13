import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { getSiteIcon } from "@/features/site/site-icons";
import type { BusinessProfile, LinkItem } from "@/types/site";

interface FooterProps {
  business: BusinessProfile;
  quickLinks: LinkItem[];
}

const Footer = ({ business, quickLinks }: FooterProps) => {
  const LogoIcon = getSiteIcon(business.logoIcon);

  return (
    <footer className="border-t bg-card py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <a href="#" className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-foreground">
              <LogoIcon className="h-6 w-6 text-primary" /> {business.name}
            </a>
            <p className="text-sm text-muted-foreground">{business.tagline}</p>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-bold text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href={business.phoneHref} className="transition-colors hover:text-foreground">
                  {business.phoneLabel}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${business.email}`} className="transition-colors hover:text-foreground">
                  {business.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {business.addressLines.join(", ")}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-bold text-foreground">Hours</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {business.hours.map((hour, index) => (
                <li key={hour.label} className={hour.highlight ? "mt-2 text-xs font-semibold text-accent" : index === 0 ? "flex items-center gap-2" : "pl-6"}>
                  {index === 0 && !hour.highlight ? <Clock className="h-4 w-4" /> : null}
                  {hour.label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-bold text-foreground">Quick Links</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          Copyright {new Date().getFullYear()} {business.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

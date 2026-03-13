import { useState } from "react";
import { Menu, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getSiteIcon } from "@/features/site/site-icons";
import type { BusinessProfile, NavbarContent } from "@/types/site";

interface NavbarProps {
  business: BusinessProfile;
  content: NavbarContent;
}

const Navbar = ({ business, content }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const LogoIcon = getSiteIcon(business.logoIcon);

  return (
    <nav className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <LogoIcon className="h-6 w-6 text-primary" />
          {business.name}
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {content.links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
          <a href={business.phoneHref} className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <Phone className="h-4 w-4" /> {business.phoneLabel}
          </a>
          <Button asChild>
            <a href="#booking">{content.callToActionLabel}</a>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="font-display">Menu</SheetTitle>
            <div className="mt-6 flex flex-col gap-4">
              {content.links.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">
                  {link.label}
                </a>
              ))}
              <Button asChild className="mt-4">
                <a href="#booking" onClick={() => setOpen(false)}>
                  {content.callToActionLabel}
                </a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;

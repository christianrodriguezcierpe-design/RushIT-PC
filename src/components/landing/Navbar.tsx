import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Monitor, Phone } from "lucide-react";

const links = [
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#booking" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Monitor className="h-6 w-6 text-primary" />
          ByteFix Pro
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
          <a href="tel:+15551234567" className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <Phone className="h-4 w-4" /> (555) 123-4567
          </a>
          <Button asChild>
            <a href="#booking">Book Now</a>
          </Button>
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="font-display">Menu</SheetTitle>
            <div className="mt-6 flex flex-col gap-4">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">
                  {l.label}
                </a>
              ))}
              <Button asChild className="mt-4">
                <a href="#booking" onClick={() => setOpen(false)}>Book Now</a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;

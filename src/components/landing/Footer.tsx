import { Monitor, Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-card py-12">
    <div className="container">
      <div className="grid gap-8 md:grid-cols-4">
        {/* Brand */}
        <div>
          <a href="#" className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Monitor className="h-6 w-6 text-primary" /> ByteFix Pro
          </a>
          <p className="text-sm text-muted-foreground">Expert PC assembly, repair, and maintenance. Your trusted local tech partner.</p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-3 font-display text-sm font-bold text-foreground">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> (555) 123-4567</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@bytefixpro.com</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> 123 Tech Street, Suite 100, Metro City, ST 12345</li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h4 className="mb-3 font-display text-sm font-bold text-foreground">Hours</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> Mon–Fri: 9am – 7pm</li>
            <li className="pl-6">Sat: 10am – 5pm</li>
            <li className="pl-6">Sun: Closed</li>
            <li className="mt-2 text-xs text-accent font-semibold">Emergency service available 24/7</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-3 font-display text-sm font-bold text-foreground">Quick Links</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><a href="#services" className="hover:text-foreground transition-colors">Services</a></li>
            <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
            <li><a href="#reviews" className="hover:text-foreground transition-colors">Reviews</a></li>
            <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
            <li><a href="#booking" className="hover:text-foreground transition-colors">Book Now</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ByteFix Pro. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

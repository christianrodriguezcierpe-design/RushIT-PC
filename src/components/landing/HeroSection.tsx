import { Button } from "@/components/ui/button";
import { Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => (
  <section className="relative overflow-hidden py-24 md:py-36" style={{ background: "var(--hero-gradient)" }}>
    {/* Decorative grid */}
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 100% / 0.3) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

    <div className="container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl"
      >
        <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary-foreground/80">
          ⚡ Same-Day Service Available
        </span>
        <h1 className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-6xl lg:text-7xl">
          Expert PC Assembly
          <br />
          <span className="text-accent">& Repair</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg text-primary-foreground/70 md:text-xl">
          From custom gaming rigs to emergency fixes — we build, repair, and optimize your PCs with precision and care. Trusted by 500+ happy customers.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="animate-pulse-glow text-base" asChild>
            <a href="#booking">
              Book Now <ArrowRight className="ml-1 h-5 w-5" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <a href="tel:+15551234567">
              <Phone className="mr-2 h-5 w-5" /> Call Us
            </a>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;

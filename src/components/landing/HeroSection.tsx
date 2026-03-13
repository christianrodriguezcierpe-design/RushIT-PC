import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { HeroSectionContent } from "@/types/site";

interface HeroSectionProps {
  content: HeroSectionContent;
}

const HeroSection = ({ content }: HeroSectionProps) => (
  <section className="relative overflow-hidden py-24 md:py-36" style={{ background: "var(--hero-gradient)" }}>
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 100% / 0.3) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

    <div className="container relative z-10">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
        <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary-foreground/80">
          {content.badge}
        </span>
        <h1 className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-6xl lg:text-7xl">
          {content.title}
          <br />
          <span className="text-accent">{content.highlightedTitle}</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg text-primary-foreground/70 md:text-xl">{content.description}</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="animate-pulse-glow text-base" asChild>
            <a href={content.primaryCtaHref}>
              {content.primaryCtaLabel} <ArrowRight className="ml-1 h-5 w-5" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <a href={content.secondaryCtaHref}>
              <Phone className="mr-2 h-5 w-5" /> {content.secondaryCtaLabel}
            </a>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;

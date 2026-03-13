import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PricingSectionContent } from "@/types/site";

interface PricingTableProps {
  content: PricingSectionContent;
}

const PricingTable = ({ content }: PricingTableProps) => (
  <section id="pricing" className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {[...content.tiers].sort((left, right) => left.order - right.order).map((tier, index) => (
          <motion.div key={tier.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
            <Card className={`relative flex h-full flex-col ${tier.popular ? "border-primary shadow-lg shadow-primary/10" : ""}`}>
              {tier.popular ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  {content.popularBadgeLabel}
                </div>
              ) : null}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <p className="mt-4 font-display text-4xl font-bold text-foreground">{tier.priceLabel}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={tier.popular ? "default" : "outline"} asChild>
                  <a href="#booking">{content.callToActionLabel}</a>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingTable;

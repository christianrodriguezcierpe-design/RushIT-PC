import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteIcon } from "@/features/site/site-icons";
import type { ServicesSectionContent } from "@/types/site";

interface ServicesGridProps {
  content: ServicesSectionContent;
}

const ServicesGrid = ({ content }: ServicesGridProps) => (
  <section id="services" className="bg-muted/50 py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...content.items].sort((left, right) => left.order - right.order).map((service, index) => {
          const Icon = getSiteIcon(service.icon);

          return (
            <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
              <Card className="group h-full transition-shadow hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="#booking">{content.bookLinkLabel}</a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default ServicesGrid;

import { motion } from "framer-motion";

import { getSiteIcon } from "@/features/site/site-icons";
import type { HowItWorksSectionContent } from "@/types/site";

interface HowItWorksProps {
  content: HowItWorksSectionContent;
}

const HowItWorks = ({ content }: HowItWorksProps) => (
  <section id="how-it-works" className="bg-muted/50 py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
        {[...content.steps].sort((left, right) => left.order - right.order).map((step, index, steps) => {
          const Icon = getSiteIcon(step.icon);

          return (
            <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 ? <div className="mx-auto mt-6 hidden h-px w-24 bg-border md:block" /> : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default HowItWorks;

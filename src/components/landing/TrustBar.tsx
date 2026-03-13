import { motion } from "framer-motion";

import { getSiteIcon } from "@/features/site/site-icons";
import type { TrustBarSectionContent } from "@/types/site";

interface TrustBarProps {
  content: TrustBarSectionContent;
}

const TrustBar = ({ content }: TrustBarProps) => (
  <section className="border-b bg-card py-6">
    <div className="container">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {[...content.items].sort((left, right) => left.order - right.order).map((item) => {
          const Icon = getSiteIcon(item.icon);

          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.supportingText}</p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export default TrustBar;

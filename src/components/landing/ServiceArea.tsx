import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

import type { BusinessProfile, ServiceAreaSectionContent } from "@/types/site";

interface ServiceAreaProps {
  business: BusinessProfile;
  content: ServiceAreaSectionContent;
}

const ServiceArea = ({ business, content }: ServiceAreaProps) => (
  <section id="service-area" className="bg-muted/50 py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mx-auto max-w-3xl">
        <div className="rounded-xl border bg-card p-8">
          <div className="mb-6 flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-display font-bold text-foreground">{business.name}</p>
              <p className="text-sm text-muted-foreground">{business.addressLines.join(", ")}</p>
            </div>
          </div>
          <p className="mb-4 text-sm font-semibold text-foreground">{content.areasLabel}</p>
          <div className="flex flex-wrap gap-2">
            {[...content.areas].sort((left, right) => left.order - right.order).map((area) => (
              <span key={area.label} className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {area.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ServiceArea;

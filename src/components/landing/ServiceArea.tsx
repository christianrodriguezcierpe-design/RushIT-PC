import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

const areas = [
  "Downtown", "Westside", "Eastside", "North Hills", "South Valley",
  "Midtown", "Harbor District", "University Area", "Tech Park", "Suburbia Heights",
];

const ServiceArea = () => (
  <section className="py-20 bg-muted/50">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Service Area</h2>
        <p className="mt-3 text-muted-foreground">We serve the greater metro area and surrounding neighborhoods.</p>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl"
      >
        <div className="rounded-xl border bg-card p-8">
          <div className="mb-6 flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-display font-bold text-foreground">ByteFix Pro</p>
              <p className="text-sm text-muted-foreground">123 Tech Street, Suite 100, Metro City, ST 12345</p>
            </div>
          </div>
          <p className="mb-4 text-sm font-semibold text-foreground">Areas We Serve:</p>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <span key={a} className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {a}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ServiceArea;

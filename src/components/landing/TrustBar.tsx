import { Star, Shield, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { icon: Star, label: "4.9★ Rating", sub: "200+ Reviews" },
  { icon: Clock, label: "10+ Years", sub: "In Business" },
  { icon: Shield, label: "Fully Insured", sub: "& Licensed" },
  { icon: Award, label: "90-Day", sub: "Guarantee" },
];

const TrustBar = () => (
  <section className="border-b bg-card py-6">
    <div className="container">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-6 md:grid-cols-4"
      >
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <item.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default TrustBar;

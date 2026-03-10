import { MessageSquare, Search, Wrench } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: MessageSquare, title: "1. Contact Us", desc: "Reach out via our form, phone, or email. Tell us what's going on." },
  { icon: Search, title: "2. Diagnose", desc: "We run a full diagnostic to pinpoint the issue or plan your build." },
  { icon: Wrench, title: "3. Fix / Build", desc: "We repair or assemble your PC and deliver it back to you, good as new." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 bg-muted/50">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
        <p className="mt-3 text-muted-foreground">Three simple steps to get your PC running perfectly.</p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <s.icon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
            {i < steps.length - 1 && (
              <div className="mx-auto mt-6 hidden h-px w-24 bg-border md:block" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;

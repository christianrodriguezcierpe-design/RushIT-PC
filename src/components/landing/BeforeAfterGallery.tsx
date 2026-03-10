import { motion } from "framer-motion";

const items = [
  { before: "Dusty, overheating tower PC with tangled cables", after: "Clean internals, fresh thermal paste, tidy cable management", label: "Deep Clean & Cable Mgmt" },
  { before: "Slow laptop with 4GB RAM and HDD", after: "16GB RAM + NVMe SSD upgrade, 5x faster boot", label: "Performance Upgrade" },
  { before: "Old prebuilt with outdated GPU", after: "Custom RTX 4070 build with RGB lighting", label: "Full Custom Build" },
  { before: "Virus-infected system, pop-ups everywhere", after: "Clean OS install, malware-free, secured", label: "Virus Removal" },
];

const BeforeAfterGallery = () => (
  <section className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Before & After</h2>
        <p className="mt-3 text-muted-foreground">Real transformations from our workshop.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <div className="grid grid-cols-2">
              <div className="flex items-center justify-center bg-destructive/10 p-6">
                <div className="text-center">
                  <span className="mb-2 inline-block rounded bg-destructive/20 px-2 py-0.5 text-xs font-bold text-destructive">BEFORE</span>
                  <p className="text-sm text-muted-foreground">{item.before}</p>
                </div>
              </div>
              <div className="flex items-center justify-center bg-primary/5 p-6">
                <div className="text-center">
                  <span className="mb-2 inline-block rounded bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">AFTER</span>
                  <p className="text-sm text-muted-foreground">{item.after}</p>
                </div>
              </div>
            </div>
            <div className="border-t px-4 py-3">
              <p className="text-center font-display text-sm font-semibold text-foreground">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default BeforeAfterGallery;

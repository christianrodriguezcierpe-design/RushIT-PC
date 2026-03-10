import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, HardDrive, Cpu, Shield, Wifi, Wrench, Database, Zap, Settings } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { icon: Monitor, title: "Custom PC Build", desc: "Tailored builds for gaming, work, or content creation." },
  { icon: Wrench, title: "PC Repair", desc: "Hardware & software troubleshooting and fixes." },
  { icon: Cpu, title: "Hardware Upgrade", desc: "RAM, GPU, SSD upgrades for better performance." },
  { icon: Shield, title: "Virus Removal", desc: "Deep scans and malware cleanup to protect your data." },
  { icon: Database, title: "Data Recovery", desc: "Recover lost files from damaged or corrupted drives." },
  { icon: HardDrive, title: "OS Installation", desc: "Fresh Windows/Linux installs with driver setup." },
  { icon: Wifi, title: "Network Setup", desc: "Home & office Wi-Fi, router config, and cable runs." },
  { icon: Zap, title: "Performance Tune-Up", desc: "Speed optimization, cleanup, and thermal management." },
  { icon: Settings, title: "Preventive Maintenance", desc: "Regular checkups to keep your PC running smoothly." },
];

const ServicesGrid = () => (
  <section id="services" className="py-20 bg-muted/50">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Our Services</h2>
        <p className="mt-3 text-muted-foreground">Everything your PC needs, under one roof.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group h-full transition-shadow hover:shadow-lg hover:shadow-primary/5">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="ghost" size="sm" asChild>
                  <a href="#booking">Book this →</a>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesGrid;

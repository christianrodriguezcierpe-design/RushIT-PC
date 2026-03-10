import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Basic Diagnostic",
    price: "$49",
    desc: "Find out what's wrong",
    features: ["Full hardware diagnostic", "Software health check", "Written report", "Repair estimate"],
    popular: false,
  },
  {
    name: "Standard Repair",
    price: "$129",
    desc: "Most common issues fixed",
    features: ["Everything in Basic", "Hardware/software repair", "Virus & malware removal", "OS tune-up", "30-day guarantee"],
    popular: true,
  },
  {
    name: "Premium Build",
    price: "From $299",
    desc: "Custom PC assembly",
    features: ["Full custom build", "Parts consultation", "Cable management", "OS & driver install", "Stress testing", "90-day guarantee"],
    popular: false,
  },
];

const PricingTable = () => (
  <section id="pricing" className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Simple, Transparent Pricing</h2>
        <p className="mt-3 text-muted-foreground">No hidden fees. No surprises.</p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {tiers.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative h-full flex flex-col ${t.popular ? "border-primary shadow-lg shadow-primary/10" : ""}`}>
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{t.name}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
                <p className="mt-4 font-display text-4xl font-bold text-foreground">{t.price}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={t.popular ? "default" : "outline"} asChild>
                  <a href="#booking">Get Started</a>
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

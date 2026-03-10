import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const cases = [
  {
    title: "Gaming Rig for Competitive Player",
    problem: "Client needed a high-FPS, low-latency build for tournament play within a tight budget.",
    solution: "Sourced best-value components, custom-built with optimized airflow and overclocked CPU.",
    result: "Consistent 240+ FPS in competitive titles, came in $200 under budget.",
  },
  {
    title: "Small Business Server Recovery",
    problem: "A local accounting firm's server crashed during tax season with years of client data at risk.",
    solution: "Emergency same-day response. Recovered data from failing RAID array, migrated to new hardware.",
    result: "100% data recovery, zero downtime for the firm. Now on a preventive maintenance plan.",
  },
  {
    title: "Home Office Network Overhaul",
    problem: "Remote worker experiencing constant Wi-Fi drops and slow speeds in a large home.",
    solution: "Installed mesh network, ran Ethernet to office, configured QoS for video calls.",
    result: "Full coverage, 10x speed improvement, zero dropped calls since install.",
  },
];

const CaseStudies = () => (
  <section className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Case Studies</h2>
        <p className="mt-3 text-muted-foreground">A deeper look at some of our projects.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {cases.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase text-destructive">Problem</p>
                  <p className="text-sm text-muted-foreground">{c.problem}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-primary">Solution</p>
                  <p className="text-sm text-muted-foreground">{c.solution}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-accent">Result</p>
                  <p className="text-sm text-muted-foreground">{c.result}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CaseStudies;

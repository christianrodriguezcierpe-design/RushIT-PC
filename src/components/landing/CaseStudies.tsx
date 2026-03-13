import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CaseStudiesSectionContent } from "@/types/site";

interface CaseStudiesProps {
  content: CaseStudiesSectionContent;
}

const CaseStudies = ({ content }: CaseStudiesProps) => (
  <section id="case-studies" className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {[...content.items].sort((left, right) => left.order - right.order).map((item, index) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase text-destructive">Problem</p>
                  <p className="text-sm text-muted-foreground">{item.problem}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-primary">Solution</p>
                  <p className="text-sm text-muted-foreground">{item.solution}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-accent">Result</p>
                  <p className="text-sm text-muted-foreground">{item.result}</p>
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

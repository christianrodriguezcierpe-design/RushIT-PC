import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { getSiteIcon } from "@/features/site/site-icons";
import type { TeamSectionContent } from "@/types/site";

interface TeamSectionProps {
  content: TeamSectionContent;
}

const TeamSection = ({ content }: TeamSectionProps) => (
  <section id="team" className="bg-muted/50 py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
        {[...content.items].sort((left, right) => left.order - right.order).map((member, index) => {
          const Icon = getSiteIcon(member.icon);

          return (
            <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <Card className="h-full text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default TeamSection;

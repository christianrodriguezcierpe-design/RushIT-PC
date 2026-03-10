import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const team = [
  { name: "Carlos Rivera", role: "Founder & Lead Technician", bio: "15+ years building and repairing PCs. A+ and Network+ certified." },
  { name: "Emily Chen", role: "Custom Build Specialist", bio: "Passionate about creating the perfect gaming and workstation builds." },
  { name: "David Okonkwo", role: "Data Recovery Expert", bio: "Specializes in RAID recovery and forensic data retrieval." },
];

const TeamSection = () => (
  <section className="py-20 bg-muted/50">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Meet the Team</h2>
        <p className="mt-3 text-muted-foreground">Skilled, certified, and passionate about PCs.</p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
        {team.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{t.name}</h3>
                <p className="text-sm font-medium text-primary">{t.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.bio}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TeamSection;

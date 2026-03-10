import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const posts = [
  { title: "5 Signs Your PC Needs a Tune-Up", excerpt: "Slow boot times? Random crashes? Here's how to tell if your PC is crying for help.", date: "Mar 5, 2026" },
  { title: "SSD vs HDD: Which Should You Choose?", excerpt: "We break down speed, cost, and durability to help you pick the right storage.", date: "Feb 20, 2026" },
  { title: "How to Keep Your PC Cool in Summer", excerpt: "Overheating kills components. Learn our top tips for thermal management.", date: "Feb 10, 2026" },
];

const BlogSection = () => (
  <section className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">From Our Blog</h2>
        <p className="mt-3 text-muted-foreground">Tips, guides, and PC wisdom.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <p className="text-xs text-muted-foreground">{p.date}</p>
                <CardTitle className="text-lg">{p.title}</CardTitle>
                <CardDescription>{p.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="link" className="px-0">Read More →</Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default BlogSection;

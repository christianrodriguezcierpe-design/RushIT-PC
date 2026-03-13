import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPreviewSectionContent } from "@/types/site";

interface BlogSectionProps {
  content: BlogPreviewSectionContent;
}

const BlogSection = ({ content }: BlogSectionProps) => (
  <section id="blog" className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[...content.posts].sort((left, right) => left.order - right.order).map((post, index) => (
          <motion.div key={post.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
            <Card className="flex h-full flex-col">
              <CardHeader>
                <p className="text-xs text-muted-foreground">{post.publishedAtLabel}</p>
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="link" className="px-0">
                  {content.readMoreLabel}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default BlogSection;

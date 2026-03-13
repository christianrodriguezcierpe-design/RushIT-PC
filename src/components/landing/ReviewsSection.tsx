import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { ReviewsSectionContent } from "@/types/site";

interface ReviewsSectionProps {
  content: ReviewsSectionContent;
}

const ReviewsSection = ({ content }: ReviewsSectionProps) => (
  <section id="reviews" className="bg-muted/50 py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...content.items].sort((left, right) => left.order - right.order).map((review, index) => (
          <motion.div key={review.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className={`h-4 w-4 ${starIndex < review.rating ? "fill-accent text-accent" : "text-muted"}`} />
                  ))}
                </div>
                <p className="mb-4 text-sm italic text-muted-foreground">"{review.text}"</p>
                <p className="font-display text-sm font-semibold text-foreground">- {review.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ReviewsSection;

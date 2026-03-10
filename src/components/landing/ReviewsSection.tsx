import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
  { name: "Alex M.", text: "Built my dream gaming PC exactly to spec. Cable management was chef's kiss. Will be back for upgrades!", rating: 5 },
  { name: "Sarah K.", text: "My laptop was dying — they recovered all my photos and upgraded it to feel brand new. Lifesavers!", rating: 5 },
  { name: "James R.", text: "Same-day repair for a fried motherboard. Super professional and affordable. Highly recommend.", rating: 5 },
  { name: "Priya D.", text: "They set up our entire small office network. Fast, clean, and everything just works.", rating: 4 },
  { name: "Mike T.", text: "Best PC shop in town. Fair pricing, honest assessments, and they actually explain what's wrong.", rating: 5 },
  { name: "Linda W.", text: "Virus removal + full tune-up made my old desktop usable again. Great service!", rating: 5 },
];

const ReviewsSection = () => (
  <section id="reviews" className="py-20 bg-muted/50">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">What Our Customers Say</h2>
        <p className="mt-3 text-muted-foreground">Real reviews from real people.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`h-4 w-4 ${si < r.rating ? "fill-accent text-accent" : "text-muted"}`} />
                  ))}
                </div>
                <p className="mb-4 text-sm text-muted-foreground italic">"{r.text}"</p>
                <p className="font-display text-sm font-semibold text-foreground">— {r.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ReviewsSection;

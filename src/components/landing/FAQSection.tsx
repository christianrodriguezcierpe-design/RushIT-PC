import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  { q: "How long does a typical repair take?", a: "Most repairs are completed within 24–48 hours. Same-day service is available for emergencies." },
  { q: "Do you offer a warranty on repairs?", a: "Yes! All repairs come with a 30-day warranty. Custom builds include a 90-day warranty." },
  { q: "Can I bring my own parts for a custom build?", a: "Absolutely. We're happy to assemble with your parts or source components for you at competitive prices." },
  { q: "Do you do house calls?", a: "Yes, we offer on-site service within our service area for an additional travel fee." },
  { q: "What payment methods do you accept?", a: "We accept cash, credit/debit cards, Venmo, Zelle, and PayPal." },
  { q: "Is there a diagnostic fee?", a: "Our $49 diagnostic fee is waived if you proceed with the repair." },
];

const FAQSection = () => (
  <section id="faq" className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Frequently Asked Questions</h2>
        <p className="mt-3 text-muted-foreground">Got questions? We've got answers.</p>
      </div>
      <div className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQSection;

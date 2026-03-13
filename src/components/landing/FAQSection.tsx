import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FaqSectionContent } from "@/types/site";

interface FAQSectionProps {
  content: FaqSectionContent;
}

const FAQSection = ({ content }: FAQSectionProps) => (
  <section id="faq" className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <div className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          {[...content.items].sort((left, right) => left.order - right.order).map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-display">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQSection;

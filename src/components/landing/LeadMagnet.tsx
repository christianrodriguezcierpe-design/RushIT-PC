import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSiteIcon } from "@/features/site/site-icons";
import type { LeadMagnetSectionContent } from "@/types/site";

interface LeadMagnetProps {
  content: LeadMagnetSectionContent;
}

const LeadMagnet = ({ content }: LeadMagnetProps) => {
  const [email, setEmail] = useState("");
  const Icon = getSiteIcon(content.icon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(content.successMessage);
    setEmail("");
  };

  return (
    <section id="lead-magnet" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-lg md:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20">
            <Icon className="h-7 w-7 text-accent" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">{content.title}</h2>
          <p className="mb-6 text-sm text-muted-foreground">{content.description}</p>
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-3">
            <Input type="email" placeholder={content.inputPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit">{content.buttonLabel}</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;

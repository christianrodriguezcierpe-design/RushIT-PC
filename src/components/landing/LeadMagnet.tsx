import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LeadMagnet = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Check your inbox! Your free checklist is on the way.");
    setEmail("");
  };

  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-lg md:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20">
            <Download className="h-7 w-7 text-accent" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Free PC Maintenance Checklist</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Keep your PC running smoothly — download our free 12-point maintenance guide. No spam, ever.
          </p>
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">Get It Free</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;

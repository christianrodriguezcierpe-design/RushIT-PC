import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const BookingSection = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", service: "", date: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Booking request sent! We'll get back to you within 2 hours.");
    setFormData({ name: "", email: "", phone: "", service: "", date: "", message: "" });
  };

  return (
    <section id="booking" className="py-20 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Book Your Service</h2>
            <p className="mt-3 text-muted-foreground">Fill out the form and we'll get back to you ASAP.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-lg md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <Input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              <Select value={formData.service} onValueChange={(v) => setFormData({ ...formData, service: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repair">PC Repair</SelectItem>
                  <SelectItem value="build">Custom Build</SelectItem>
                  <SelectItem value="upgrade">Hardware Upgrade</SelectItem>
                  <SelectItem value="virus">Virus Removal</SelectItem>
                  <SelectItem value="data">Data Recovery</SelectItem>
                  <SelectItem value="network">Network Setup</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input type="date" placeholder="Preferred Date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            <Textarea placeholder="Describe your issue or what you need..." rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
            <Button type="submit" size="lg" className="w-full">Submit Booking Request</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;

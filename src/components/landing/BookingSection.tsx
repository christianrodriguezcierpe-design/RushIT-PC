import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAppointmentRequestMutation } from "@/features/appointments/use-appointment-workflow";
import type { BookingSectionContent } from "@/types/site";

interface BookingSectionProps {
  content: BookingSectionContent;
}

const BookingSection = ({ content }: BookingSectionProps) => {
  const createAppointmentRequestMutation = useCreateAppointmentRequestMutation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedService = content.serviceOptions.find((option) => option.value === formData.service);

    if (!selectedService) {
      toast.error("Select a service before submitting the request.");
      return;
    }

    try {
      await createAppointmentRequestMutation.mutateAsync({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceKey: selectedService.value,
        serviceLabel: selectedService.label,
        preferredDate: formData.date,
        preferredTime: formData.time,
        message: formData.message,
      });
      toast.success(content.successMessage);
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        date: "",
        time: "",
        message: "",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit the appointment request.";
      toast.error(message);
    }
  };

  return (
    <section id="booking" className="bg-muted/50 py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
            <p className="mt-3 text-muted-foreground">{content.description}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-lg md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder={content.namePlaceholder} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input type="email" placeholder={content.emailPlaceholder} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <Input type="tel" placeholder={content.phonePlaceholder} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={content.servicePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {[...content.serviceOptions].sort((left, right) => left.order - right.order).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="date" placeholder={content.datePlaceholder} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              <Input type="time" placeholder={content.timePlaceholder} value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
            </div>
            <Textarea placeholder={content.messagePlaceholder} rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
            <Button type="submit" size="lg" className="w-full" disabled={createAppointmentRequestMutation.isPending}>
              {createAppointmentRequestMutation.isPending ? "Submitting..." : content.submitLabel}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;

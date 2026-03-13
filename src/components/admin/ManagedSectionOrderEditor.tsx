import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReorderManagedSectionsMutation } from "@/features/site/use-site-definition";
import type { ManagedSectionConfig, ManagedSectionKey } from "@/types/site";

interface ManagedSectionOrderEditorProps {
  sections: ManagedSectionConfig[];
  canReorder: boolean;
}

const sectionLabels: Record<ManagedSectionKey, string> = {
  trustBar: "Trust bar",
  services: "Services",
  pricing: "Pricing",
  howItWorks: "How it works",
  beforeAfterGallery: "Before/after gallery",
  reviews: "Reviews",
  caseStudies: "Case studies",
  team: "Team",
  leadMagnet: "Lead magnet",
  serviceArea: "Service area",
  faq: "FAQ",
  booking: "Appointment request",
  blogPreview: "Blog preview",
};

const ManagedSectionOrderEditor = ({
  sections,
  canReorder,
}: ManagedSectionOrderEditorProps) => {
  const mutation = useReorderManagedSectionsMutation();
  const reorderableSections = sections
    .filter((section) => section.enabled && section.adminReorderable)
    .sort((left, right) => left.order - right.order);
  const [orderedKeys, setOrderedKeys] = useState<ManagedSectionKey[]>(
    reorderableSections.map((section) => section.key),
  );

  useEffect(() => {
    setOrderedKeys(
      sections
        .filter((section) => section.enabled && section.adminReorderable)
        .sort((left, right) => left.order - right.order)
        .map((section) => section.key),
    );
  }, [sections]);

  const isDirty =
    orderedKeys.length === reorderableSections.length &&
    orderedKeys.some((key, index) => key !== reorderableSections[index]?.key);

  const moveSection = (fromIndex: number, toIndex: number) => {
    setOrderedKeys((current) => {
      if (toIndex < 0 || toIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await mutation.mutateAsync(orderedKeys);
      toast.success("Section order saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save section order.";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Section order</CardTitle>
        <CardDescription>
          Reorder the allowed landing sections. Locked sections like the navbar, hero, and footer stay fixed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canReorder ? (
          <p className="text-sm text-muted-foreground">
            Section ordering is currently locked for this deployment.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {orderedKeys.map((sectionKey, index) => (
                <div
                  key={sectionKey}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{sectionLabels[sectionKey]}</p>
                    <p className="text-sm text-muted-foreground">Position {index + 1}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveSection(index, index - 1)}
                      disabled={index === 0}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveSection(index, index + 1)}
                      disabled={index === orderedKeys.length - 1}
                    >
                      Down
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" onClick={handleSave} disabled={!isDirty || mutation.isPending}>
              Save section order
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagedSectionOrderEditor;

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { siteIconOptions } from "@/features/site/site-icons";
import { useUpdateManagedSectionContentMutation } from "@/features/site/use-site-definition";
import type { ServicesSectionContent, SiteIconName } from "@/types/site";

interface ServicesEditorProps {
  content: ServicesSectionContent;
}

const cloneServicesContent = (content: ServicesSectionContent): ServicesSectionContent => {
  return JSON.parse(JSON.stringify(content)) as ServicesSectionContent;
};

const normalizeItems = (items: ServicesSectionContent["items"]) => {
  return items.map((item, index) => ({
    ...item,
    order: (index + 1) * 10,
  }));
};

const createServiceItem = (): ServicesSectionContent["items"][number] => ({
  icon: "Monitor",
  title: "",
  description: "",
  order: 0,
});

const ServicesEditor = ({ content }: ServicesEditorProps) => {
  const mutation = useUpdateManagedSectionContentMutation<"services">();
  const [draft, setDraft] = useState<ServicesSectionContent>(() => cloneServicesContent(content));

  useEffect(() => {
    setDraft(cloneServicesContent(content));
  }, [content]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(content);

  const moveItem = (fromIndex: number, toIndex: number) => {
    setDraft((current) => {
      if (toIndex < 0 || toIndex >= current.items.length) {
        return current;
      }

      const nextItems = [...current.items];
      const [item] = nextItems.splice(fromIndex, 1);
      nextItems.splice(toIndex, 0, item);

      return {
        ...current,
        items: normalizeItems(nextItems),
      };
    });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedContent: ServicesSectionContent = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      bookLinkLabel: draft.bookLinkLabel.trim(),
      items: normalizeItems(
        draft.items.map((item) => ({
          ...item,
          title: item.title.trim(),
          description: item.description.trim(),
        })),
      ),
    };

    try {
      await mutation.mutateAsync({
        sectionKey: "services",
        content: normalizedContent,
      });
      toast.success("Services content saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save services content.";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Services</CardTitle>
        <CardDescription>Edit the section copy and the order of service cards.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="services-title">Section title</Label>
              <Input
                id="services-title"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="services-book-link">CTA label</Label>
              <Input
                id="services-book-link"
                value={draft.bookLinkLabel}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, bookLinkLabel: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="services-description">Description</Label>
            <Textarea
              id="services-description"
              rows={3}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Service cards</h3>
                <p className="text-sm text-muted-foreground">Reorder or update the visible service list.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    items: normalizeItems([...current.items, createServiceItem()]),
                  }))
                }
              >
                Add service
              </Button>
            </div>

            <div className="space-y-4">
              {draft.items.map((item, index) => (
                <div key={`${index}-${item.title}`} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Service {index + 1}</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveItem(index, index - 1)}
                        disabled={index === 0}
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveItem(index, index + 1)}
                        disabled={index === draft.items.length - 1}
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            items:
                              current.items.length === 1
                                ? [createServiceItem()]
                                : normalizeItems(
                                    current.items.filter((_, itemIndex) => itemIndex !== index),
                                  ),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={item.title}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            items: current.items.map((serviceItem, itemIndex) =>
                              itemIndex === index
                                ? { ...serviceItem, title: event.target.value }
                                : serviceItem,
                            ),
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select
                        value={item.icon}
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            items: current.items.map((serviceItem, itemIndex) =>
                              itemIndex === index
                                ? { ...serviceItem, icon: value as SiteIconName }
                                : serviceItem,
                            ),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {siteIconOptions.map((iconName) => (
                            <SelectItem key={iconName} value={iconName}>
                              {iconName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={item.description}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((serviceItem, itemIndex) =>
                            itemIndex === index
                              ? { ...serviceItem, description: event.target.value }
                              : serviceItem,
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={!isDirty || mutation.isPending}>
            Save services
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServicesEditor;

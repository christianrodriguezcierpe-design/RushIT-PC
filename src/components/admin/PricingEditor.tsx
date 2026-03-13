import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateManagedSectionContentMutation } from "@/features/site/use-site-definition";
import type { PricingSectionContent } from "@/types/site";

interface PricingEditorProps {
  content: PricingSectionContent;
}

const clonePricingContent = (content: PricingSectionContent): PricingSectionContent => {
  return JSON.parse(JSON.stringify(content)) as PricingSectionContent;
};

const normalizeTiers = (tiers: PricingSectionContent["tiers"]) => {
  return tiers.map((tier, index) => ({
    ...tier,
    order: (index + 1) * 10,
  }));
};

const getFeaturesValue = (features: string[]) => {
  return features.join("\n");
};

const parseFeaturesValue = (featuresValue: string) => {
  return featuresValue
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean);
};

const createPricingTier = (): PricingSectionContent["tiers"][number] => ({
  name: "",
  priceLabel: "",
  description: "",
  features: [],
  popular: false,
  order: 0,
});

const PricingEditor = ({ content }: PricingEditorProps) => {
  const mutation = useUpdateManagedSectionContentMutation<"pricing">();
  const [draft, setDraft] = useState<PricingSectionContent>(() => clonePricingContent(content));

  useEffect(() => {
    setDraft(clonePricingContent(content));
  }, [content]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(content);

  const moveTier = (fromIndex: number, toIndex: number) => {
    setDraft((current) => {
      if (toIndex < 0 || toIndex >= current.tiers.length) {
        return current;
      }

      const nextTiers = [...current.tiers];
      const [item] = nextTiers.splice(fromIndex, 1);
      nextTiers.splice(toIndex, 0, item);

      return {
        ...current,
        tiers: normalizeTiers(nextTiers),
      };
    });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedContent: PricingSectionContent = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      popularBadgeLabel: draft.popularBadgeLabel.trim(),
      callToActionLabel: draft.callToActionLabel.trim(),
      tiers: normalizeTiers(
        draft.tiers.map((tier) => ({
          ...tier,
          name: tier.name.trim(),
          priceLabel: tier.priceLabel.trim(),
          description: tier.description.trim(),
          features: tier.features.map((feature) => feature.trim()).filter(Boolean),
        })),
      ),
    };

    try {
      await mutation.mutateAsync({
        sectionKey: "pricing",
        content: normalizedContent,
      });
      toast.success("Pricing content saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save pricing content.";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Pricing</CardTitle>
        <CardDescription>Edit pricing copy, plans, feature lists, and the highlighted tier.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pricing-title">Section title</Label>
              <Input
                id="pricing-title"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricing-cta-label">CTA label</Label>
              <Input
                id="pricing-cta-label"
                value={draft.callToActionLabel}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, callToActionLabel: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pricing-description">Description</Label>
              <Textarea
                id="pricing-description"
                rows={3}
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricing-popular-badge">Popular badge label</Label>
              <Input
                id="pricing-popular-badge"
                value={draft.popularBadgeLabel}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, popularBadgeLabel: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Pricing tiers</h3>
                <p className="text-sm text-muted-foreground">Add, remove, reorder, and highlight plans.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    tiers: normalizeTiers([...current.tiers, createPricingTier()]),
                  }))
                }
              >
                Add tier
              </Button>
            </div>

            <div className="space-y-4">
              {draft.tiers.map((tier, index) => (
                <div key={`${index}-${tier.name}`} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Tier {index + 1}</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveTier(index, index - 1)}
                        disabled={index === 0}
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveTier(index, index + 1)}
                        disabled={index === draft.tiers.length - 1}
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
                            tiers:
                              current.tiers.length === 1
                                ? [createPricingTier()]
                                : normalizeTiers(
                                    current.tiers.filter((_, tierIndex) => tierIndex !== index),
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
                      <Label>Name</Label>
                      <Input
                        value={tier.name}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            tiers: current.tiers.map((item, tierIndex) =>
                              tierIndex === index ? { ...item, name: event.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price label</Label>
                      <Input
                        value={tier.priceLabel}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            tiers: current.tiers.map((item, tierIndex) =>
                              tierIndex === index ? { ...item, priceLabel: event.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={tier.description}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          tiers: current.tiers.map((item, tierIndex) =>
                            tierIndex === index ? { ...item, description: event.target.value } : item,
                          ),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Features</Label>
                    <Textarea
                      rows={5}
                      value={getFeaturesValue(tier.features)}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          tiers: current.tiers.map((item, tierIndex) =>
                            tierIndex === index
                              ? { ...item, features: parseFeaturesValue(event.target.value) }
                              : item,
                          ),
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">Enter one feature per line.</p>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={tier.popular ?? false}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          tiers: current.tiers.map((item, tierIndex) =>
                            tierIndex === index
                              ? { ...item, popular: event.target.checked }
                              : event.target.checked
                                ? { ...item, popular: false }
                                : item,
                          ),
                        }))
                      }
                    />
                    Highlight as popular tier
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={!isDirty || mutation.isPending}>
            Save pricing
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PricingEditor;

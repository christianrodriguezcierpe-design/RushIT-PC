import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateManagedSectionContentMutation } from "@/features/site/use-site-definition";
import type { ReviewsSectionContent } from "@/types/site";

interface ReviewsEditorProps {
  content: ReviewsSectionContent;
}

const cloneReviewsContent = (content: ReviewsSectionContent): ReviewsSectionContent => {
  return JSON.parse(JSON.stringify(content)) as ReviewsSectionContent;
};

const normalizeItems = (items: ReviewsSectionContent["items"]) => {
  return items.map((item, index) => ({
    ...item,
    order: (index + 1) * 10,
  }));
};

const createReviewItem = (): ReviewsSectionContent["items"][number] => ({
  name: "",
  text: "",
  rating: 5,
  order: 0,
});

const ReviewsEditor = ({ content }: ReviewsEditorProps) => {
  const mutation = useUpdateManagedSectionContentMutation<"reviews">();
  const [draft, setDraft] = useState<ReviewsSectionContent>(() => cloneReviewsContent(content));

  useEffect(() => {
    setDraft(cloneReviewsContent(content));
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

    const normalizedContent: ReviewsSectionContent = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      items: normalizeItems(
        draft.items.map((item) => ({
          ...item,
          name: item.name.trim(),
          text: item.text.trim(),
          rating: Math.max(1, Math.min(5, item.rating)),
        })),
      ),
    };

    try {
      await mutation.mutateAsync({
        sectionKey: "reviews",
        content: normalizedContent,
      });
      toast.success("Reviews content saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save reviews content.";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Reviews</CardTitle>
        <CardDescription>Manage manual testimonials and their display order.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reviews-title">Section title</Label>
            <Input
              id="reviews-title"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviews-description">Description</Label>
            <Textarea
              id="reviews-description"
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
                <h3 className="text-sm font-semibold text-foreground">Testimonials</h3>
                <p className="text-sm text-muted-foreground">Edit customer names, copy, ratings, and order.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    items: normalizeItems([...current.items, createReviewItem()]),
                  }))
                }
              >
                Add review
              </Button>
            </div>

            <div className="space-y-4">
              {draft.items.map((item, index) => (
                <div key={`${index}-${item.name}`} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Review {index + 1}</p>
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
                                ? [createReviewItem()]
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

                  <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={item.name}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            items: current.items.map((reviewItem, itemIndex) =>
                              itemIndex === index
                                ? { ...reviewItem, name: event.target.value }
                                : reviewItem,
                            ),
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={item.rating}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            items: current.items.map((reviewItem, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...reviewItem,
                                    rating: Number(event.target.value) || 1,
                                  }
                                : reviewItem,
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Review text</Label>
                    <Textarea
                      rows={4}
                      value={item.text}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((reviewItem, itemIndex) =>
                            itemIndex === index
                              ? { ...reviewItem, text: event.target.value }
                              : reviewItem,
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
            Save reviews
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewsEditor;

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateManagedSectionContentMutation } from "@/features/site/use-site-definition";
import type { FaqSectionContent } from "@/types/site";

interface FaqEditorProps {
  content: FaqSectionContent;
}

const cloneFaqContent = (content: FaqSectionContent): FaqSectionContent => {
  return JSON.parse(JSON.stringify(content)) as FaqSectionContent;
};

const normalizeItems = (items: FaqSectionContent["items"]) => {
  return items.map((item, index) => ({
    ...item,
    order: (index + 1) * 10,
  }));
};

const createFaqItem = (): FaqSectionContent["items"][number] => ({
  question: "",
  answer: "",
  order: 0,
});

const FaqEditor = ({ content }: FaqEditorProps) => {
  const mutation = useUpdateManagedSectionContentMutation<"faq">();
  const [draft, setDraft] = useState<FaqSectionContent>(() => cloneFaqContent(content));

  useEffect(() => {
    setDraft(cloneFaqContent(content));
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

    const normalizedContent: FaqSectionContent = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      items: normalizeItems(
        draft.items.map((item) => ({
          ...item,
          question: item.question.trim(),
          answer: item.answer.trim(),
        })),
      ),
    };

    try {
      await mutation.mutateAsync({
        sectionKey: "faq",
        content: normalizedContent,
      });
      toast.success("FAQ content saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save FAQ content.";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">FAQ</CardTitle>
        <CardDescription>Edit questions, answers, and their display order.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="faq-title">Section title</Label>
            <Input
              id="faq-title"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-description">Description</Label>
            <Textarea
              id="faq-description"
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
                <h3 className="text-sm font-semibold text-foreground">FAQ items</h3>
                <p className="text-sm text-muted-foreground">Add, remove, or reorder common questions.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    items: normalizeItems([...current.items, createFaqItem()]),
                  }))
                }
              >
                Add question
              </Button>
            </div>

            <div className="space-y-4">
              {draft.items.map((item, index) => (
                <div key={`${index}-${item.question}`} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Question {index + 1}</p>
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
                                ? [createFaqItem()]
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

                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input
                      value={item.question}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((faqItem, itemIndex) =>
                            itemIndex === index
                              ? { ...faqItem, question: event.target.value }
                              : faqItem,
                          ),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Answer</Label>
                    <Textarea
                      rows={4}
                      value={item.answer}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((faqItem, itemIndex) =>
                            itemIndex === index
                              ? { ...faqItem, answer: event.target.value }
                              : faqItem,
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
            Save FAQ
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FaqEditor;

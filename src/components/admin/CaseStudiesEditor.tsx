import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateManagedSectionContentMutation } from "@/features/site/use-site-definition";
import type { CaseStudiesSectionContent } from "@/types/site";

interface CaseStudiesEditorProps {
  content: CaseStudiesSectionContent;
}

const cloneCaseStudiesContent = (content: CaseStudiesSectionContent): CaseStudiesSectionContent => {
  return JSON.parse(JSON.stringify(content)) as CaseStudiesSectionContent;
};

const normalizeItems = (items: CaseStudiesSectionContent["items"]) => {
  return items.map((item, index) => ({
    ...item,
    order: (index + 1) * 10,
  }));
};

const createCaseStudy = (): CaseStudiesSectionContent["items"][number] => ({
  title: "",
  problem: "",
  solution: "",
  result: "",
  order: 0,
});

const CaseStudiesEditor = ({ content }: CaseStudiesEditorProps) => {
  const mutation = useUpdateManagedSectionContentMutation<"caseStudies">();
  const [draft, setDraft] = useState<CaseStudiesSectionContent>(() => cloneCaseStudiesContent(content));

  useEffect(() => {
    setDraft(cloneCaseStudiesContent(content));
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

    const normalizedContent: CaseStudiesSectionContent = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      items: normalizeItems(
        draft.items.map((item) => ({
          ...item,
          title: item.title.trim(),
          problem: item.problem.trim(),
          solution: item.solution.trim(),
          result: item.result.trim(),
        })),
      ),
    };

    try {
      await mutation.mutateAsync({
        sectionKey: "caseStudies",
        content: normalizedContent,
      });
      toast.success("Case studies content saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save case studies content.";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Case studies</CardTitle>
        <CardDescription>Edit the section copy and the order of case study cards.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="case-studies-title">Section title</Label>
            <Input
              id="case-studies-title"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="case-studies-description">Description</Label>
            <Textarea
              id="case-studies-description"
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
                <h3 className="text-sm font-semibold text-foreground">Case studies</h3>
                <p className="text-sm text-muted-foreground">Add, remove, or reorder case study cards.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    items: normalizeItems([...current.items, createCaseStudy()]),
                  }))
                }
              >
                Add case study
              </Button>
            </div>

            <div className="space-y-4">
              {draft.items.map((item, index) => (
                <div key={`${index}-${item.title}`} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Case study {index + 1}</p>
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
                                ? [createCaseStudy()]
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
                    <Label>Title</Label>
                    <Input
                      value={item.title}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((caseStudy, itemIndex) =>
                            itemIndex === index
                              ? { ...caseStudy, title: event.target.value }
                              : caseStudy,
                          ),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Problem</Label>
                    <Textarea
                      rows={3}
                      value={item.problem}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((caseStudy, itemIndex) =>
                            itemIndex === index
                              ? { ...caseStudy, problem: event.target.value }
                              : caseStudy,
                          ),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Solution</Label>
                    <Textarea
                      rows={3}
                      value={item.solution}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((caseStudy, itemIndex) =>
                            itemIndex === index
                              ? { ...caseStudy, solution: event.target.value }
                              : caseStudy,
                          ),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Result</Label>
                    <Textarea
                      rows={3}
                      value={item.result}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((caseStudy, itemIndex) =>
                            itemIndex === index
                              ? { ...caseStudy, result: event.target.value }
                              : caseStudy,
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
            Save case studies
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CaseStudiesEditor;

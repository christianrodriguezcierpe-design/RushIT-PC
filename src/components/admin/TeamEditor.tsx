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
import type { SiteIconName, TeamSectionContent } from "@/types/site";

interface TeamEditorProps {
  content: TeamSectionContent;
}

const cloneTeamContent = (content: TeamSectionContent): TeamSectionContent => {
  return JSON.parse(JSON.stringify(content)) as TeamSectionContent;
};

const normalizeItems = (items: TeamSectionContent["items"]) => {
  return items.map((item, index) => ({
    ...item,
    order: (index + 1) * 10,
  }));
};

const createTeamMember = (): TeamSectionContent["items"][number] => ({
  name: "",
  role: "",
  bio: "",
  icon: "User",
  order: 0,
});

const TeamEditor = ({ content }: TeamEditorProps) => {
  const mutation = useUpdateManagedSectionContentMutation<"team">();
  const [draft, setDraft] = useState<TeamSectionContent>(() => cloneTeamContent(content));

  useEffect(() => {
    setDraft(cloneTeamContent(content));
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

    const normalizedContent: TeamSectionContent = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      items: normalizeItems(
        draft.items.map((item) => ({
          ...item,
          name: item.name.trim(),
          role: item.role.trim(),
          bio: item.bio.trim(),
        })),
      ),
    };

    try {
      await mutation.mutateAsync({
        sectionKey: "team",
        content: normalizedContent,
      });
      toast.success("Team content saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save team content.";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Team</CardTitle>
        <CardDescription>Edit the team section copy and the order of member cards.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="team-title">Section title</Label>
            <Input
              id="team-title"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
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
                <h3 className="text-sm font-semibold text-foreground">Team members</h3>
                <p className="text-sm text-muted-foreground">Add, remove, or reorder the visible team cards.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    items: normalizeItems([...current.items, createTeamMember()]),
                  }))
                }
              >
                Add member
              </Button>
            </div>

            <div className="space-y-4">
              {draft.items.map((item, index) => (
                <div key={`${index}-${item.name}`} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Member {index + 1}</p>
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
                                ? [createTeamMember()]
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
                      <Label>Name</Label>
                      <Input
                        value={item.name}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            items: current.items.map((member, itemIndex) =>
                              itemIndex === index ? { ...member, name: event.target.value } : member,
                            ),
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={item.role}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            items: current.items.map((member, itemIndex) =>
                              itemIndex === index ? { ...member, role: event.target.value } : member,
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={item.icon}
                      onValueChange={(value) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((member, itemIndex) =>
                            itemIndex === index
                              ? { ...member, icon: value as SiteIconName }
                              : member,
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

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      rows={4}
                      value={item.bio}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          items: current.items.map((member, itemIndex) =>
                            itemIndex === index ? { ...member, bio: event.target.value } : member,
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
            Save team
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeamEditor;

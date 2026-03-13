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
import { useUpdateBusinessProfileMutation } from "@/features/site/use-site-definition";
import type { BusinessHour, BusinessProfile, SiteIconName } from "@/types/site";

interface BusinessProfileEditorProps {
  businessProfile: BusinessProfile;
}

const cloneBusinessProfile = (businessProfile: BusinessProfile): BusinessProfile => {
  return JSON.parse(JSON.stringify(businessProfile)) as BusinessProfile;
};

const createEmptyHour = (): BusinessHour => ({
  label: "",
  highlight: false,
});

const BusinessProfileEditor = ({ businessProfile }: BusinessProfileEditorProps) => {
  const mutation = useUpdateBusinessProfileMutation();
  const [draft, setDraft] = useState<BusinessProfile>(() => cloneBusinessProfile(businessProfile));

  useEffect(() => {
    setDraft(cloneBusinessProfile(businessProfile));
  }, [businessProfile]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(businessProfile);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedBusinessProfile: BusinessProfile = {
      ...draft,
      name: draft.name.trim(),
      tagline: draft.tagline.trim(),
      phoneLabel: draft.phoneLabel.trim(),
      phoneHref: draft.phoneHref.trim(),
      email: draft.email.trim(),
      addressLines: draft.addressLines.map((line) => line.trim()).filter(Boolean),
      hours: draft.hours
        .map((hour) => ({
          label: hour.label.trim(),
          highlight: hour.highlight ?? false,
        }))
        .filter((hour) => hour.label),
    };

    if (!normalizedBusinessProfile.name) {
      toast.error("Business name is required.");
      return;
    }

    try {
      await mutation.mutateAsync(normalizedBusinessProfile);
      toast.success("Business profile saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save the business profile.";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Business profile</CardTitle>
        <CardDescription>Core business identity, contact details, address, and hours.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business name</Label>
              <Input
                id="business-name"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-logo-icon">Logo icon</Label>
              <Select
                value={draft.logoIcon}
                onValueChange={(value) =>
                  setDraft((current) => ({ ...current, logoIcon: value as SiteIconName }))
                }
              >
                <SelectTrigger id="business-logo-icon">
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
            <Label htmlFor="business-tagline">Tagline</Label>
            <Textarea
              id="business-tagline"
              rows={3}
              value={draft.tagline}
              onChange={(event) => setDraft((current) => ({ ...current, tagline: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="business-phone-label">Phone label</Label>
              <Input
                id="business-phone-label"
                value={draft.phoneLabel}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, phoneLabel: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-phone-href">Phone link</Label>
              <Input
                id="business-phone-href"
                value={draft.phoneHref}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, phoneHref: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-email">Email</Label>
              <Input
                id="business-email"
                type="email"
                value={draft.email}
                onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Address lines</h3>
                <p className="text-sm text-muted-foreground">Shown in the footer and contact areas.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    addressLines: [...current.addressLines, ""],
                  }))
                }
              >
                Add line
              </Button>
            </div>

            <div className="space-y-3">
              {draft.addressLines.map((line, index) => (
                <div key={`${index}-${line}`} className="flex gap-3">
                  <Input
                    value={line}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        addressLines: current.addressLines.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        addressLines:
                          current.addressLines.length === 1
                            ? [""]
                            : current.addressLines.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Hours</h3>
                <p className="text-sm text-muted-foreground">Manage visible business hours and highlight rows.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    hours: [...current.hours, createEmptyHour()],
                  }))
                }
              >
                Add hour row
              </Button>
            </div>

            <div className="space-y-3">
              {draft.hours.map((hour, index) => (
                <div
                  key={`${index}-${hour.label}`}
                  className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_auto_auto]"
                >
                  <Input
                    value={hour.label}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        hours: current.hours.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, label: event.target.value } : item,
                        ),
                      }))
                    }
                  />

                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={hour.highlight ?? false}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          hours: current.hours.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, highlight: event.target.checked }
                              : item,
                          ),
                        }))
                      }
                    />
                    Highlight
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        hours:
                          current.hours.length === 1
                            ? [createEmptyHour()]
                            : current.hours.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={!isDirty || mutation.isPending}>
            Save profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileEditor;

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  collectBeforeAfterAssetPaths,
  getRemovedManagedStoragePaths,
} from "@/features/media/site-media-paths";
import {
  createEmptyImageAsset,
  deleteImageAssets,
  uploadImageAsset,
} from "@/features/media/site-media";
import { useUpdateManagedSectionContentMutation } from "@/features/site/use-site-definition";
import type { BeforeAfterSectionContent, ImageAsset } from "@/types/site";

interface BeforeAfterGalleryEditorProps {
  content: BeforeAfterSectionContent;
}

type ImageSlotKey = "beforeImage" | "afterImage";

const slotLabels: Record<ImageSlotKey, string> = {
  beforeImage: "Before image",
  afterImage: "After image",
};

const cloneBeforeAfterContent = (content: BeforeAfterSectionContent): BeforeAfterSectionContent =>
  JSON.parse(JSON.stringify(content)) as BeforeAfterSectionContent;

const normalizeItems = (items: BeforeAfterSectionContent["items"]) =>
  items.map((item, index) => ({
    ...item,
    order: (index + 1) * 10,
  }));

const createGalleryItem = (): BeforeAfterSectionContent["items"][number] => ({
  label: "",
  beforeImage: createEmptyImageAsset(),
  afterImage: createEmptyImageAsset(),
  order: 0,
});

const updateImageAlt = (asset: ImageAsset, alt: string): ImageAsset => ({
  ...asset,
  alt,
});

const BeforeAfterGalleryEditor = ({ content }: BeforeAfterGalleryEditorProps) => {
  const mutation = useUpdateManagedSectionContentMutation<"beforeAfterGallery">();
  const [draft, setDraft] = useState<BeforeAfterSectionContent>(() => cloneBeforeAfterContent(content));
  const [uploadingSlots, setUploadingSlots] = useState<string[]>([]);
  const originalAssetPaths = collectBeforeAfterAssetPaths(content);
  const originalAssetPathSet = new Set(originalAssetPaths);

  useEffect(() => {
    setDraft(cloneBeforeAfterContent(content));
  }, [content]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(content);
  const isUploading = uploadingSlots.length > 0;

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

  const updateItem = (
    index: number,
    updater: (item: BeforeAfterSectionContent["items"][number]) => BeforeAfterSectionContent["items"][number],
  ) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item)),
    }));
  };

  const cleanupDraftOnlyPaths = async (paths: string[]) => {
    const safePaths = paths.filter((path) => Boolean(path) && !originalAssetPathSet.has(path));

    if (safePaths.length === 0) {
      return;
    }

    await deleteImageAssets(safePaths);
  };

  const handleImageUpload = async ({
    index,
    slotKey,
    file,
  }: {
    index: number;
    slotKey: ImageSlotKey;
    file: File;
  }) => {
    const slotId = `${index}-${slotKey}`;
    const currentItem = draft.items[index];

    if (!currentItem) {
      return;
    }

    setUploadingSlots((current) => [...current, slotId]);
    const previousPath = currentItem[slotKey].path;

    try {
      const sideLabel = slotKey === "beforeImage" ? "before" : "after";
      const asset = await uploadImageAsset({
        file,
        folder: `before-after-gallery/${sideLabel}`,
        alt:
          currentItem[slotKey].alt.trim() ||
          `${currentItem.label || `Gallery item ${index + 1}`} ${sideLabel} image`,
      });

      updateItem(index, (item) => ({
        ...item,
        [slotKey]: asset,
      }));

      if (previousPath && previousPath !== asset.path) {
        await cleanupDraftOnlyPaths([previousPath]);
      }

      toast.success(`${slotLabels[slotKey]} uploaded.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Unable to upload the ${slotLabels[slotKey].toLowerCase()}.`;
      toast.error(message);
    } finally {
      setUploadingSlots((current) => current.filter((value) => value !== slotId));
    }
  };

  const handleClearImage = async (index: number, slotKey: ImageSlotKey) => {
    const currentItem = draft.items[index];

    if (!currentItem) {
      return;
    }

    const currentPath = currentItem[slotKey].path;

    updateItem(index, (item) => ({
      ...item,
      [slotKey]: {
        ...createEmptyImageAsset(),
        alt: item[slotKey].alt,
      },
    }));

    try {
      await cleanupDraftOnlyPaths([currentPath]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to clean up the removed image asset.";
      toast.error(message);
    }
  };

  const handleRemoveItem = async (index: number) => {
    const currentItem = draft.items[index];

    setDraft((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? [createGalleryItem()]
          : normalizeItems(current.items.filter((_, itemIndex) => itemIndex !== index)),
    }));

    if (!currentItem) {
      return;
    }

    try {
      await cleanupDraftOnlyPaths([
        currentItem.beforeImage.path,
        currentItem.afterImage.path,
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to clean up the removed gallery media.";
      toast.error(message);
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedContent: BeforeAfterSectionContent = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      items: normalizeItems(
        draft.items.map((item) => ({
          ...item,
          label: item.label.trim(),
          beforeImage: {
            ...item.beforeImage,
            alt: item.beforeImage.alt.trim(),
          },
          afterImage: {
            ...item.afterImage,
            alt: item.afterImage.alt.trim(),
          },
        })),
      ),
    };

    try {
      await mutation.mutateAsync({
        sectionKey: "beforeAfterGallery",
        content: normalizedContent,
      });

      const removedManagedPaths = getRemovedManagedStoragePaths({
        previousPaths: originalAssetPaths,
        nextPaths: collectBeforeAfterAssetPaths(normalizedContent),
      });

      if (removedManagedPaths.length > 0) {
        try {
          await deleteImageAssets(removedManagedPaths);
        } catch (cleanupError) {
          const cleanupMessage =
            cleanupError instanceof Error
              ? cleanupError.message
              : "The gallery was saved, but old media cleanup failed.";
          toast.error(cleanupMessage);
        }
      }

      toast.success("Before and after gallery saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save the before and after gallery.";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Before and after gallery</CardTitle>
        <CardDescription>
          Upload one before image and one after image per card. Uploading prepares the asset, and saving publishes the gallery content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="before-after-title">Section title</Label>
            <Input
              id="before-after-title"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="before-after-description">Description</Label>
            <Textarea
              id="before-after-description"
              rows={3}
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Gallery items</h3>
                <p className="text-sm text-muted-foreground">
                  Add, remove, or reorder transformation cards. Image uploads support PNG, JPG, WebP, AVIF, or SVG up to 5 MB.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    items: normalizeItems([...current.items, createGalleryItem()]),
                  }))
                }
              >
                Add gallery item
              </Button>
            </div>

            <div className="space-y-4">
              {draft.items.map((item, index) => (
                <div key={`${index}-${item.label}`} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Gallery item {index + 1}</p>
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
                        onClick={() => void handleRemoveItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Card label</Label>
                    <Input
                      value={item.label}
                      onChange={(event) =>
                        updateItem(index, (currentItem) => ({
                          ...currentItem,
                          label: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    {(["beforeImage", "afterImage"] as ImageSlotKey[]).map((slotKey) => {
                      const slotId = `${index}-${slotKey}`;
                      const isSlotUploading = uploadingSlots.includes(slotId);
                      const asset = item[slotKey];

                      return (
                        <div key={slotKey} className="space-y-3 rounded-lg border p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">{slotLabels[slotKey]}</p>
                            <p className="text-xs text-muted-foreground">
                              One image per side for V1. The stored media object can be expanded later.
                            </p>
                          </div>

                          <div className="aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                            {asset.url ? (
                              <img
                                src={asset.url}
                                alt={asset.alt || `${item.label} ${slotLabels[slotKey].toLowerCase()}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                                No image uploaded yet.
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`gallery-${index}-${slotKey}-file`}>Upload image</Label>
                            <Input
                              id={`gallery-${index}-${slotKey}-file`}
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                              disabled={isSlotUploading}
                              onChange={async (event) => {
                                const file = event.target.files?.[0];

                                if (!file) {
                                  return;
                                }

                                await handleImageUpload({
                                  index,
                                  slotKey,
                                  file,
                                });

                                event.target.value = "";
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`gallery-${index}-${slotKey}-alt`}>Alt text</Label>
                            <Textarea
                              id={`gallery-${index}-${slotKey}-alt`}
                              rows={3}
                              value={asset.alt}
                              onChange={(event) =>
                                updateItem(index, (currentItem) => ({
                                  ...currentItem,
                                  [slotKey]: updateImageAlt(currentItem[slotKey], event.target.value),
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                            <span className="truncate">
                              {asset.path || "No stored asset path yet."}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void handleClearImage(index, slotKey)}
                              disabled={!asset.url}
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={!isDirty || mutation.isPending || isUploading}>
            Save gallery
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BeforeAfterGalleryEditor;

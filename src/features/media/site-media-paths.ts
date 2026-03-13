import type { BeforeAfterSectionContent, SiteDefinition } from "@/types/site";

export const SITE_MEDIA_BUCKET = "site-media";

const LOCAL_MEDIA_PREFIX = "local-media/";
const SEED_MEDIA_PREFIX = "seed://";

const uniquePaths = (paths: string[]) => [...new Set(paths)];

export const isManagedStoragePath = (path: string) =>
  Boolean(path) && !path.startsWith(LOCAL_MEDIA_PREFIX) && !path.startsWith(SEED_MEDIA_PREFIX);

export const collectBeforeAfterAssetPaths = (content: BeforeAfterSectionContent) =>
  uniquePaths(
    content.items
      .flatMap((item) => [item.beforeImage.path, item.afterImage.path])
      .filter((path): path is string => Boolean(path)),
  );

export const collectSiteMediaPaths = (siteDefinition: SiteDefinition) =>
  uniquePaths([
    ...collectBeforeAfterAssetPaths(siteDefinition.landing.managedContent.beforeAfterGallery),
  ]);

export const getRemovedManagedStoragePaths = ({
  previousPaths,
  nextPaths,
}: {
  previousPaths: string[];
  nextPaths: string[];
}) => {
  const nextPathSet = new Set(nextPaths);

  return uniquePaths(
    previousPaths.filter((path) => isManagedStoragePath(path) && !nextPathSet.has(path)),
  );
};

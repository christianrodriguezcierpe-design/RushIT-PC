import { Fragment } from "react";

import { renderFixedSection, renderManagedSection } from "@/features/site/section-registry";
import { getEnabledManagedSections, getFixedSectionConfig } from "@/features/site/site-runtime";
import { useSiteDefinition } from "@/features/site/use-site-definition";

const Index = () => {
  const { data: site, isLoading, isError } = useSiteDefinition();

  if (isLoading || !site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">Loading the site experience...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">The site configuration could not be loaded.</p>
      </div>
    );
  }

  const managedSections = getEnabledManagedSections(site);

  return (
    <div className="min-h-screen bg-background" style={{ background: "var(--page-background)" }}>
      {getFixedSectionConfig(site, "emergencyBanner") ? renderFixedSection(site, "emergencyBanner") : null}
      {getFixedSectionConfig(site, "navbar") ? renderFixedSection(site, "navbar") : null}
      {getFixedSectionConfig(site, "hero") ? renderFixedSection(site, "hero") : null}
      <main>
        {managedSections.map((section) => (
          <Fragment key={section.key}>{renderManagedSection(site, section.key)}</Fragment>
        ))}
      </main>
      {getFixedSectionConfig(site, "footer") ? renderFixedSection(site, "footer") : null}
    </div>
  );
};

export default Index;

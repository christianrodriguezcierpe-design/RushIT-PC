import { beforeEach, describe, expect, it } from "vitest";

import { defaultSiteDefinition } from "@/data/siteSeed";
import {
  addAppointmentRequestNote,
  createAppointmentRequest,
  listAppointmentWorkflowRecords,
  updateAppointmentRequestStatus,
} from "@/features/appointments/appointment-repository";
import {
  collectBeforeAfterAssetPaths,
  collectSiteMediaPaths,
  getRemovedManagedStoragePaths,
} from "@/features/media/site-media-paths";
import { uploadImageAsset } from "@/features/media/site-media";
import {
  loadSiteDefinition,
  reorderManagedSections,
  updateBusinessProfile,
  updateManagedSectionContent,
} from "@/features/site/site-repository";
import {
  getFooterQuickLinks,
  getEnabledManagedSections,
  getFixedSectionConfig,
  hasEnabledAddOn,
} from "@/features/site/site-runtime";
import {
  buildSiteRecordPayload,
  hydrateSiteDefinition,
  normalizeBeforeAfterContent,
} from "@/features/site/site-storage";

describe("site runtime", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns enabled managed sections in ascending order", () => {
    const managedSections = getEnabledManagedSections(defaultSiteDefinition);

    expect(managedSections.map((section) => section.key)).toEqual([
      "trustBar",
      "services",
      "pricing",
      "howItWorks",
      "beforeAfterGallery",
      "reviews",
      "caseStudies",
      "team",
      "leadMagnet",
      "serviceArea",
      "faq",
      "booking",
      "blogPreview",
    ]);
  });

  it("keeps locked sections available through fixed config lookup", () => {
    expect(getFixedSectionConfig(defaultSiteDefinition, "hero")?.lockedPosition).toBe("hero");
    expect(getFixedSectionConfig(defaultSiteDefinition, "footer")?.lockedPosition).toBe("footer");
  });

  it("round-trips the preset through storage rows", () => {
    const records = buildSiteRecordPayload(defaultSiteDefinition);
    const hydratedSiteDefinition = hydrateSiteDefinition(records);

    expect(hydratedSiteDefinition.business.name).toBe(defaultSiteDefinition.business.name);
    expect(hydratedSiteDefinition.packageConfig.notificationProvider).toBe(
      defaultSiteDefinition.packageConfig.notificationProvider,
    );
    expect(hydratedSiteDefinition.packageConfig.enabledAddOns).toEqual(defaultSiteDefinition.packageConfig.enabledAddOns);
    expect(hydratedSiteDefinition.landing.managedSections.map((section) => section.key)).toEqual(
      defaultSiteDefinition.landing.managedSections.map((section) => section.key),
    );
  });

  it("collects site media paths from the before/after gallery", () => {
    const mediaPaths = collectSiteMediaPaths(defaultSiteDefinition);

    expect(mediaPaths).toHaveLength(8);
    expect(mediaPaths.every((path) => path.startsWith("seed://before-after/"))).toBe(true);
  });

  it("normalizes legacy before/after text content into media objects", () => {
    const normalizedContent = normalizeBeforeAfterContent({
      title: "Before & After",
      description: "Legacy data shape",
      items: [
        {
          label: "Cable cleanup",
          before: "Dusty tower before service",
          after: "Clean cables after service",
          order: 10,
        },
      ],
    });

    expect(normalizedContent.items[0]?.beforeImage.url.startsWith("data:image/svg+xml")).toBe(true);
    expect(normalizedContent.items[0]?.beforeImage.alt).toContain("Dusty tower before service");
    expect(normalizedContent.items[0]?.afterImage.alt).toContain("Clean cables after service");
  });

  it("calculates removed managed storage paths without touching local or seed assets", () => {
    const previousPaths = [
      ...collectBeforeAfterAssetPaths(defaultSiteDefinition.landing.managedContent.beforeAfterGallery),
      "before-after-gallery/before/live-asset-a.png",
      "before-after-gallery/after/live-asset-b.png",
      "local-media/before-after-gallery/example.png",
    ];
    const nextPaths = [
      ...collectBeforeAfterAssetPaths(defaultSiteDefinition.landing.managedContent.beforeAfterGallery),
      "before-after-gallery/after/live-asset-b.png",
    ];

    expect(
      getRemovedManagedStoragePaths({
        previousPaths,
        nextPaths,
      }),
    ).toEqual(["before-after-gallery/before/live-asset-a.png"]);
  });

  it("reports notification add-on entitlement from package config", () => {
    expect(hasEnabledAddOn(defaultSiteDefinition, "notifications")).toBe(false);
    expect(hasEnabledAddOn(defaultSiteDefinition, "pricing")).toBe(true);
  });

  it("derives footer links from enabled managed sections", () => {
    const quickLinks = getFooterQuickLinks(defaultSiteDefinition);

    expect(quickLinks.some((link) => link.href === "#services")).toBe(true);
    expect(quickLinks.some((link) => link.href === "#pricing")).toBe(true);
    expect(quickLinks.some((link) => link.href === "#booking")).toBe(true);
    expect(quickLinks.some((link) => link.href === "#blog")).toBe(true);
    expect(quickLinks.some((link) => link.href === "#trust-bar")).toBe(false);
  });

  it("creates local workflow records when Supabase is not configured", async () => {
    const request = await createAppointmentRequest({
      customerName: "Taylor Smith",
      customerEmail: "taylor@example.com",
      customerPhone: "(555) 444-1212",
      serviceKey: "repair",
      serviceLabel: "PC Repair",
      preferredDate: "2026-03-20",
      preferredTime: "10:30",
      message: "Desktop is shutting off unexpectedly.",
    });

    await addAppointmentRequestNote(request.id, "Customer prefers a morning callback.", null);
    await updateAppointmentRequestStatus(request.id, "accepted", null);

    const workflowRecords = await listAppointmentWorkflowRecords();

    expect(workflowRecords).toHaveLength(1);
    expect(workflowRecords[0].request.status).toBe("accepted");
    expect(workflowRecords[0].notes).toHaveLength(1);
    expect(workflowRecords[0].notifications.map((notification) => notification.eventType)).toEqual([
      "customer_accepted",
      "admin_new_request",
    ]);
    expect(workflowRecords[0].notifications.map((notification) => notification.status)).toEqual([
      "skipped",
      "skipped",
    ]);
    expect(workflowRecords[0].notifications.every((notification) => notification.provider === "postmark")).toBe(true);
  });

  it("persists local business profile edits when Supabase is not configured", async () => {
    await updateBusinessProfile({
      ...defaultSiteDefinition.business,
      name: "Northline PC Care",
      phoneLabel: "(555) 000-1122",
    });

    const siteDefinition = await loadSiteDefinition();

    expect(siteDefinition.business.name).toBe("Northline PC Care");
    expect(siteDefinition.business.phoneLabel).toBe("(555) 000-1122");
  });

  it("reorders managed sections in local fallback mode", async () => {
    const currentOrder = defaultSiteDefinition.landing.managedSections.map((section) => section.key);
    const nextOrder = [currentOrder[1], currentOrder[0], ...currentOrder.slice(2)];

    await reorderManagedSections(nextOrder);

    const siteDefinition = await loadSiteDefinition();

    expect(siteDefinition.landing.managedSections[0]?.key).toBe(currentOrder[1]);
    expect(siteDefinition.landing.managedSections[1]?.key).toBe(currentOrder[0]);
  });

  it("updates managed section content in local fallback mode", async () => {
    await updateManagedSectionContent("services", {
      ...defaultSiteDefinition.landing.managedContent.services,
      title: "Core Services",
      items: [
        ...defaultSiteDefinition.landing.managedContent.services.items,
        {
          icon: "Zap",
          title: "Express Tune-Up",
          description: "Fast same-day optimization for urgent performance issues.",
          order: 100,
        },
      ],
    });

    const siteDefinition = await loadSiteDefinition();

    expect(siteDefinition.landing.managedContent.services.title).toBe("Core Services");
    expect(
      siteDefinition.landing.managedContent.services.items.some(
        (item) => item.title === "Express Tune-Up",
      ),
    ).toBe(true);
  });

  it("updates pricing content in local fallback mode", async () => {
    await updateManagedSectionContent("pricing", {
      ...defaultSiteDefinition.landing.managedContent.pricing,
      title: "Flexible Pricing",
      tiers: [
        {
          name: "Starter",
          priceLabel: "$79",
          description: "Best for small repair jobs.",
          features: ["Basic inspection", "Repair estimate"],
          popular: false,
          order: 10,
        },
        {
          name: "Priority",
          priceLabel: "$149",
          description: "Fast-track service with priority turnaround.",
          features: ["Priority queue", "Same-day diagnostics", "30-day support"],
          popular: true,
          order: 20,
        },
      ],
    });

    const siteDefinition = await loadSiteDefinition();

    expect(siteDefinition.landing.managedContent.pricing.title).toBe("Flexible Pricing");
    expect(siteDefinition.landing.managedContent.pricing.tiers).toHaveLength(2);
    expect(siteDefinition.landing.managedContent.pricing.tiers[1]?.popular).toBe(true);
  });

  it("updates team content in local fallback mode", async () => {
    await updateManagedSectionContent("team", {
      ...defaultSiteDefinition.landing.managedContent.team,
      title: "Meet Our Experts",
      items: [
        ...defaultSiteDefinition.landing.managedContent.team.items,
        {
          name: "Jordan Patel",
          role: "Systems Specialist",
          bio: "Handles performance tuning and workstation optimization.",
          icon: "Settings",
          order: 40,
        },
      ],
    });

    const siteDefinition = await loadSiteDefinition();

    expect(siteDefinition.landing.managedContent.team.title).toBe("Meet Our Experts");
    expect(
      siteDefinition.landing.managedContent.team.items.some(
        (item) => item.name === "Jordan Patel",
      ),
    ).toBe(true);
  });

  it("updates case studies content in local fallback mode", async () => {
    await updateManagedSectionContent("caseStudies", {
      ...defaultSiteDefinition.landing.managedContent.caseStudies,
      title: "Recent Success Stories",
      items: [
        ...defaultSiteDefinition.landing.managedContent.caseStudies.items,
        {
          title: "Office Laptop Fleet Refresh",
          problem: "The client had aging laptops causing repeated downtime for staff.",
          solution: "Standardized replacement hardware, migrated data, and preconfigured software images.",
          result: "Deployment completed over one weekend with no lost work time.",
          order: 40,
        },
      ],
    });

    const siteDefinition = await loadSiteDefinition();

    expect(siteDefinition.landing.managedContent.caseStudies.title).toBe("Recent Success Stories");
    expect(
      siteDefinition.landing.managedContent.caseStudies.items.some(
        (item) => item.title === "Office Laptop Fleet Refresh",
      ),
    ).toBe(true);
  });

  it("uploads local gallery images as data urls when Supabase is not configured", async () => {
    const asset = await uploadImageAsset({
      file: new File(["gallery"], "before.png", { type: "image/png" }),
      folder: "before-after-gallery/before",
      alt: "Dusty tower before cleanup",
    });

    expect(asset.url.startsWith("data:image/png;base64,")).toBe(true);
    expect(asset.path).toContain("local-media/before-after-gallery");
    expect(asset.alt).toBe("Dusty tower before cleanup");
  });

  it("updates before/after gallery content in local fallback mode", async () => {
    await updateManagedSectionContent("beforeAfterGallery", {
      ...defaultSiteDefinition.landing.managedContent.beforeAfterGallery,
      title: "Workshop Transformations",
      items: [
        ...defaultSiteDefinition.landing.managedContent.beforeAfterGallery.items,
        {
          label: "Office desktop refresh",
          beforeImage: {
            url: "data:image/png;base64,b2xkLWJlaGluZA==",
            path: "local-media/before-after-gallery/office-desktop-refresh-before.png",
            alt: "Office desktop before cleanup and hardware refresh.",
          },
          afterImage: {
            url: "data:image/png;base64,bmV3LWJlaGluZA==",
            path: "local-media/before-after-gallery/office-desktop-refresh-after.png",
            alt: "Office desktop after cleanup and SSD upgrade.",
          },
          order: 50,
        },
      ],
    });

    const siteDefinition = await loadSiteDefinition();

    expect(siteDefinition.landing.managedContent.beforeAfterGallery.title).toBe("Workshop Transformations");
    expect(
      siteDefinition.landing.managedContent.beforeAfterGallery.items.some(
        (item) => item.label === "Office desktop refresh" && Boolean(item.beforeImage.url),
      ),
    ).toBe(true);
  });

  it("marks local notifications as failed when the add-on is enabled without a real sender", async () => {
    window.localStorage.setItem(
      "service-biz:site-definition",
      JSON.stringify({
        ...defaultSiteDefinition,
        packageConfig: {
          ...defaultSiteDefinition.packageConfig,
          enabledAddOns: [...defaultSiteDefinition.packageConfig.enabledAddOns, "notifications"],
        },
      }),
    );

    const request = await createAppointmentRequest({
      customerName: "Jordan Lee",
      customerEmail: "jordan@example.com",
      customerPhone: "(555) 999-0000",
      serviceKey: "repair",
      serviceLabel: "PC Repair",
      preferredDate: "2026-04-02",
      preferredTime: "14:00",
      message: "Screen flickers after startup.",
    });

    await updateAppointmentRequestStatus(request.id, "rejected", null);

    const workflowRecords = await listAppointmentWorkflowRecords();

    expect(workflowRecords[0].notifications.map((notification) => notification.status)).toEqual([
      "failed",
      "failed",
    ]);
    expect(workflowRecords[0].notifications[0]?.errorMessage).toContain("local mode");
  });

  it("uses the configured SMTP provider in local notification logs", async () => {
    window.localStorage.setItem(
      "service-biz:site-definition",
      JSON.stringify({
        ...defaultSiteDefinition,
        packageConfig: {
          ...defaultSiteDefinition.packageConfig,
          notificationProvider: "smtp",
          enabledAddOns: [...defaultSiteDefinition.packageConfig.enabledAddOns, "notifications"],
        },
      }),
    );

    const request = await createAppointmentRequest({
      customerName: "Avery Stone",
      customerEmail: "avery@example.com",
      customerPhone: "(555) 222-1000",
      serviceKey: "repair",
      serviceLabel: "PC Repair",
      preferredDate: "2026-04-08",
      preferredTime: "09:00",
      message: "Boot loop after update.",
    });

    await updateAppointmentRequestStatus(request.id, "accepted", null);

    const workflowRecords = await listAppointmentWorkflowRecords();

    expect(workflowRecords[0].notifications.every((notification) => notification.provider === "smtp")).toBe(true);
    expect(workflowRecords[0].notifications[0]?.errorMessage).toContain("SMTP");
  });
});

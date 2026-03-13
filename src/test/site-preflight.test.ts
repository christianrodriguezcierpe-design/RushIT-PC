import { describe, expect, it } from "vitest";

import {
  evaluateBrowserEnv,
  evaluateNotificationEnv,
  evaluateSeededRows,
  evaluateServiceEnv,
  summarizePreflightChecks,
} from "@/features/deployment/site-preflight";

describe("site preflight helpers", () => {
  it("fails browser env when the Vite Supabase values are missing", () => {
    const check = evaluateBrowserEnv({});

    expect(check.status).toBe("fail");
    expect(check.details).toContain("Missing VITE_SUPABASE_URL.");
    expect(check.details).toContain("Missing VITE_SUPABASE_ANON_KEY.");
  });

  it("fails service env when service and browser Supabase URLs disagree", () => {
    const check = evaluateServiceEnv({
      viteSupabaseUrl: "https://browser.example.supabase.co",
      supabaseUrl: "https://service.example.supabase.co",
      supabaseServiceRoleKey: "service-role-key",
    });

    expect(check.status).toBe("fail");
    expect(check.summary).toContain("does not match");
  });

  it("fails notification env when notifications are enabled without required Postmark values", () => {
    const check = evaluateNotificationEnv({
      enabledAddOns: ["notifications"],
      notificationProvider: "postmark",
      env: {},
    });

    expect(check.status).toBe("fail");
    expect(check.details).toContain("Missing POSTMARK_SERVER_TOKEN.");
    expect(check.details).toContain("Missing POSTMARK_FROM_EMAIL.");
  });

  it("warns when notifications are enabled and POSTMARK_FROM_NAME is omitted", () => {
    const check = evaluateNotificationEnv({
      enabledAddOns: ["notifications"],
      notificationProvider: "postmark",
      env: {
        postmarkServerToken: "token",
        postmarkFromEmail: "hello@example.com",
      },
    });

    expect(check.status).toBe("warn");
  });

  it("fails notification env when notifications are enabled with SMTP and required values are missing", () => {
    const check = evaluateNotificationEnv({
      enabledAddOns: ["notifications"],
      notificationProvider: "smtp",
      env: {},
    });

    expect(check.status).toBe("fail");
    expect(check.details).toContain("Missing SMTP_HOST.");
    expect(check.details).toContain("Missing SMTP_PORT.");
    expect(check.details).toContain("Missing SMTP_USERNAME.");
    expect(check.details).toContain("Missing SMTP_PASSWORD.");
    expect(check.details).toContain("Missing SMTP_FROM_EMAIL.");
  });

  it("warns when notifications are enabled with SMTP and SMTP_FROM_NAME is omitted", () => {
    const check = evaluateNotificationEnv({
      enabledAddOns: ["notifications"],
      notificationProvider: "smtp",
      env: {
        smtpHost: "smtp.example.com",
        smtpPort: "587",
        smtpUsername: "mailer@example.com",
        smtpPassword: "secret",
        smtpFromEmail: "hello@example.com",
      },
    });

    expect(check.status).toBe("warn");
  });

  it("fails seeded-row verification when required section rows are missing", () => {
    const check = evaluateSeededRows({
      hasBusinessProfile: true,
      hasDeploymentConfig: true,
      actualFixedSectionKeys: ["hero", "footer"],
      actualManagedSectionKeys: ["services", "booking"],
      expectedFixedSectionKeys: ["emergencyBanner", "navbar", "hero", "footer"],
      expectedManagedSectionKeys: ["services", "faq", "booking"],
    });

    expect(check.status).toBe("fail");
    expect(check.details?.some((detail) => detail.includes("Missing fixed section rows"))).toBe(true);
    expect(check.details?.some((detail) => detail.includes("Missing managed section rows"))).toBe(true);
  });

  it("summarizes pass, warn, and fail counts correctly", () => {
    const summary = summarizePreflightChecks([
      { id: "a", status: "pass", summary: "ok" },
      { id: "b", status: "warn", summary: "warn" },
      { id: "c", status: "fail", summary: "fail" },
    ]);

    expect(summary).toEqual({
      passed: 1,
      warned: 1,
      failed: 1,
      shouldFail: true,
    });
  });
});

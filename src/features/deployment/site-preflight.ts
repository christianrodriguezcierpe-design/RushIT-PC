import type {
  AddOnId,
  FixedSectionKey,
  ManagedSectionKey,
  NotificationProviderId,
} from "@/types/site";

export type PreflightStatus = "pass" | "warn" | "fail";

export interface PreflightCheck {
  id: string;
  status: PreflightStatus;
  summary: string;
  details?: string[];
}

export interface PreflightSummary {
  passed: number;
  warned: number;
  failed: number;
  shouldFail: boolean;
}

export interface PreflightEnvInput {
  viteSupabaseUrl?: string;
  viteSupabaseAnonKey?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  postmarkServerToken?: string;
  postmarkFromEmail?: string;
  postmarkFromName?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;
  smtpSecure?: string;
}

const getTrimmedValue = (value: string | undefined) => {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : "";
};

export const getResolvedServiceSupabaseUrl = (env: PreflightEnvInput) =>
  getTrimmedValue(env.supabaseUrl) || getTrimmedValue(env.viteSupabaseUrl);

export const createCheck = (
  id: string,
  status: PreflightStatus,
  summary: string,
  details?: string[],
): PreflightCheck => ({
  id,
  status,
  summary,
  details: details && details.length > 0 ? details : undefined,
});

export const evaluateBrowserEnv = (env: PreflightEnvInput): PreflightCheck => {
  const missingKeys = [
    !getTrimmedValue(env.viteSupabaseUrl) ? "VITE_SUPABASE_URL" : null,
    !getTrimmedValue(env.viteSupabaseAnonKey) ? "VITE_SUPABASE_ANON_KEY" : null,
  ].filter((value): value is string => Boolean(value));

  if (missingKeys.length > 0) {
    return createCheck(
      "browser-env",
      "fail",
      "Browser Supabase env is incomplete.",
      missingKeys.map((key) => `Missing ${key}.`),
    );
  }

  return createCheck("browser-env", "pass", "Browser Supabase env is configured.");
};

export const evaluateServiceEnv = (env: PreflightEnvInput): PreflightCheck => {
  const resolvedUrl = getResolvedServiceSupabaseUrl(env);
  const serviceRoleKey = getTrimmedValue(env.supabaseServiceRoleKey);
  const explicitServiceUrl = getTrimmedValue(env.supabaseUrl);
  const browserUrl = getTrimmedValue(env.viteSupabaseUrl);

  if (explicitServiceUrl && browserUrl && explicitServiceUrl !== browserUrl) {
    return createCheck(
      "service-env",
      "fail",
      "Supabase service URL does not match the browser URL.",
      [
        `SUPABASE_URL=${explicitServiceUrl}`,
        `VITE_SUPABASE_URL=${browserUrl}`,
      ],
    );
  }

  const missingKeys = [
    !resolvedUrl ? "SUPABASE_URL (or VITE_SUPABASE_URL fallback)" : null,
    !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
  ].filter((value): value is string => Boolean(value));

  if (missingKeys.length > 0) {
    return createCheck(
      "service-env",
      "fail",
      "Service-role Supabase env is incomplete.",
      missingKeys.map((key) => `Missing ${key}.`),
    );
  }

  const details =
    !explicitServiceUrl && browserUrl
      ? ["Using VITE_SUPABASE_URL as the service-script fallback."]
      : undefined;

  return createCheck("service-env", "pass", "Service-role Supabase env is configured.", details);
};

export const evaluateNotificationEnv = ({
  enabledAddOns,
  notificationProvider,
  env,
}: {
  enabledAddOns: AddOnId[];
  notificationProvider?: NotificationProviderId | null;
  env: PreflightEnvInput;
}): PreflightCheck => {
  const notificationsEnabled = enabledAddOns.includes("notifications");

  if (!notificationsEnabled) {
    return createCheck(
      "notifications-env",
      "pass",
      "Notifications add-on is disabled; notification provider env is not required.",
    );
  }

  const resolvedProvider = notificationProvider === "smtp" ? "smtp" : notificationProvider === "postmark" ? "postmark" : null;

  if (!resolvedProvider) {
    return createCheck(
      "notifications-env",
      "fail",
      "Notifications add-on is enabled but the deployment notification provider is missing or invalid.",
      ["Expected notification_provider to be either 'postmark' or 'smtp'."],
    );
  }

  if (resolvedProvider === "postmark") {
    const missingKeys = [
      !getTrimmedValue(env.postmarkServerToken) ? "POSTMARK_SERVER_TOKEN" : null,
      !getTrimmedValue(env.postmarkFromEmail) ? "POSTMARK_FROM_EMAIL" : null,
    ].filter((value): value is string => Boolean(value));

    if (missingKeys.length > 0) {
      return createCheck(
        "notifications-env",
        "fail",
        "Notifications add-on is enabled with Postmark, but required Postmark env is incomplete.",
        missingKeys.map((key) => `Missing ${key}.`),
      );
    }

    if (!getTrimmedValue(env.postmarkFromName)) {
      return createCheck(
        "notifications-env",
        "warn",
        "Notifications add-on is enabled with Postmark and required env is present, but POSTMARK_FROM_NAME is not set.",
      );
    }

    return createCheck(
      "notifications-env",
      "pass",
      "Notifications add-on is enabled and Postmark env is configured.",
    );
  }

  const missingKeys = [
    !getTrimmedValue(env.smtpHost) ? "SMTP_HOST" : null,
    !getTrimmedValue(env.smtpPort) ? "SMTP_PORT" : null,
    !getTrimmedValue(env.smtpUsername) ? "SMTP_USERNAME" : null,
    !getTrimmedValue(env.smtpPassword) ? "SMTP_PASSWORD" : null,
    !getTrimmedValue(env.smtpFromEmail) ? "SMTP_FROM_EMAIL" : null,
  ].filter((value): value is string => Boolean(value));

  if (missingKeys.length > 0) {
    return createCheck(
      "notifications-env",
      "fail",
      "Notifications add-on is enabled with SMTP, but required SMTP env is incomplete.",
      missingKeys.map((key) => `Missing ${key}.`),
    );
  }

  const smtpPort = Number.parseInt(getTrimmedValue(env.smtpPort), 10);

  if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
    return createCheck(
      "notifications-env",
      "fail",
      "Notifications add-on is enabled with SMTP, but SMTP_PORT is invalid.",
      [`Received SMTP_PORT="${getTrimmedValue(env.smtpPort)}".`],
    );
  }

  if (!getTrimmedValue(env.smtpFromName)) {
    return createCheck(
      "notifications-env",
      "warn",
      "Notifications add-on is enabled with SMTP and required env is present, but SMTP_FROM_NAME is not set.",
    );
  }

  return createCheck(
    "notifications-env",
    "pass",
    "Notifications add-on is enabled and SMTP env is configured.",
  );
};

export const evaluateSeededRows = ({
  hasBusinessProfile,
  hasDeploymentConfig,
  actualFixedSectionKeys,
  actualManagedSectionKeys,
  expectedFixedSectionKeys,
  expectedManagedSectionKeys,
}: {
  hasBusinessProfile: boolean;
  hasDeploymentConfig: boolean;
  actualFixedSectionKeys: FixedSectionKey[];
  actualManagedSectionKeys: ManagedSectionKey[];
  expectedFixedSectionKeys: FixedSectionKey[];
  expectedManagedSectionKeys: ManagedSectionKey[];
}): PreflightCheck => {
  const missingDetails: string[] = [];

  if (!hasBusinessProfile) {
    missingDetails.push("Missing business_profile row with id='default'.");
  }

  if (!hasDeploymentConfig) {
    missingDetails.push("Missing deployment_config row with id='default'.");
  }

  const fixedSectionSet = new Set(actualFixedSectionKeys);
  const missingFixedSections = expectedFixedSectionKeys.filter((key) => !fixedSectionSet.has(key));

  if (missingFixedSections.length > 0) {
    missingDetails.push(`Missing fixed section rows: ${missingFixedSections.join(", ")}.`);
  }

  const managedSectionSet = new Set(actualManagedSectionKeys);
  const missingManagedSections = expectedManagedSectionKeys.filter((key) => !managedSectionSet.has(key));

  if (missingManagedSections.length > 0) {
    missingDetails.push(`Missing managed section rows: ${missingManagedSections.join(", ")}.`);
  }

  if (missingDetails.length > 0) {
    return createCheck(
      "seeded-site-rows",
      "fail",
      "Seeded site-definition rows are incomplete.",
      missingDetails,
    );
  }

  return createCheck("seeded-site-rows", "pass", "Seeded site-definition rows are present.");
};

export const summarizePreflightChecks = (checks: PreflightCheck[]): PreflightSummary => {
  const summary = checks.reduce<PreflightSummary>(
    (currentSummary, check) => {
      if (check.status === "pass") {
        currentSummary.passed += 1;
      } else if (check.status === "warn") {
        currentSummary.warned += 1;
      } else {
        currentSummary.failed += 1;
      }

      currentSummary.shouldFail = currentSummary.failed > 0;
      return currentSummary;
    },
    {
      passed: 0,
      warned: 0,
      failed: 0,
      shouldFail: false,
    },
  );

  return summary;
};

export const formatPreflightCheck = (check: PreflightCheck) => {
  const statusLabel = check.status.toUpperCase().padEnd(4, " ");
  const detailLines = check.details?.map((detail) => `  - ${detail}`) ?? [];

  return [`[${statusLabel}] ${check.id}: ${check.summary}`, ...detailLines];
};

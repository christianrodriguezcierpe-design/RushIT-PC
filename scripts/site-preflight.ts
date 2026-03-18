import { createClient } from "@supabase/supabase-js";

import { defaultSiteDefinition } from "../src/data/siteSeed";
import {
  createCheck,
  evaluateBrowserEnv,
  evaluateNotificationEnv,
  evaluateSeededRows,
  evaluateServiceEnv,
  formatPreflightCheck,
  getResolvedServiceSupabaseUrl,
  summarizePreflightChecks,
  type PreflightCheck,
  type PreflightEnvInput,
} from "../src/features/deployment/site-preflight";
import { SITE_MEDIA_BUCKET } from "../src/features/media/site-media-paths";
import type {
  AddOnId,
  FixedSectionKey,
  ManagedSectionKey,
  NotificationProviderId,
} from "../src/types/site";

type TableCheckSpec = {
  table: string;
  select: string;
};

type TableQueryResult = {
  table: string;
  error: string | null;
};

type DeploymentConfigRow = {
  id: string;
  enabled_add_ons: AddOnId[];
  notification_provider?: NotificationProviderId | null;
};

const env: PreflightEnvInput = {
  viteSupabaseUrl: process.env.VITE_SUPABASE_URL,
  viteSupabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  postmarkServerToken: process.env.POSTMARK_SERVER_TOKEN,
  postmarkFromEmail: process.env.POSTMARK_FROM_EMAIL,
  postmarkFromName: process.env.POSTMARK_FROM_NAME,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUsername: process.env.SMTP_USERNAME,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFromEmail: process.env.SMTP_FROM_EMAIL,
  smtpFromName: process.env.SMTP_FROM_NAME,
  smtpSecure: process.env.SMTP_SECURE,
};

const tableCheckSpecs: TableCheckSpec[] = [
  { table: "business_profile", select: "id" },
  { table: "deployment_config", select: "id" },
  { table: "fixed_section_content", select: "section_key" },
  { table: "managed_section_content", select: "section_key" },
  { table: "appointment_requests", select: "id" },
  { table: "appointment_request_notes", select: "id" },
  { table: "notification_logs", select: "id" },
];

const resolvedSupabaseUrl = getResolvedServiceSupabaseUrl(env);

const createSupabaseClient = () =>
  createClient(resolvedSupabaseUrl, env.supabaseServiceRoleKey!.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

const getExpectedFixedSectionKeys = (): FixedSectionKey[] =>
  defaultSiteDefinition.landing.fixedSections.map((section) => section.key);

const getExpectedManagedSectionKeys = (): ManagedSectionKey[] =>
  defaultSiteDefinition.landing.managedSections.map((section) => section.key);

const normalizeEnabledAddOns = (value: unknown): AddOnId[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is AddOnId => typeof item === "string") as AddOnId[];
};

const checkCoreTables = async (supabase: ReturnType<typeof createSupabaseClient>) => {
  const queryResults = (await Promise.all(
    tableCheckSpecs.map(async (spec) => {
      const { error } = await supabase.from(spec.table).select(spec.select).limit(1);

      return {
        table: spec.table,
        error: error?.message ?? null,
      } satisfies TableQueryResult;
    }),
  )) as TableQueryResult[];

  const failedTables = queryResults.filter((result) => result.error);

  if (failedTables.length > 0) {
    return createCheck(
      "core-tables",
      "fail",
      "One or more required Supabase tables are missing or unreachable.",
      failedTables.map((result) => `${result.table}: ${result.error}`),
    );
  }

  return createCheck("core-tables", "pass", "Required Supabase tables are reachable.");
};

const checkSeededRows = async (supabase: ReturnType<typeof createSupabaseClient>) => {
  const [businessProfileResult, deploymentConfigResult, fixedSectionsResult, managedSectionsResult] =
    await Promise.all([
      supabase.from("business_profile").select("id").eq("id", "default").maybeSingle(),
      supabase.from("deployment_config").select("id, enabled_add_ons, notification_provider").eq("id", "default").maybeSingle(),
      supabase.from("fixed_section_content").select("section_key"),
      supabase.from("managed_section_content").select("section_key"),
    ]);

  const dataErrors = [
    businessProfileResult.error
      ? `business_profile: ${businessProfileResult.error.message}`
      : null,
    deploymentConfigResult.error
      ? `deployment_config: ${deploymentConfigResult.error.message}`
      : null,
    fixedSectionsResult.error
      ? `fixed_section_content: ${fixedSectionsResult.error.message}`
      : null,
    managedSectionsResult.error
      ? `managed_section_content: ${managedSectionsResult.error.message}`
      : null,
  ].filter((value): value is string => Boolean(value));

  if (dataErrors.length > 0) {
    return {
      check: createCheck(
        "seeded-site-rows",
        "fail",
        "Unable to verify seeded site-definition rows.",
        dataErrors,
      ),
      enabledAddOns: [] as AddOnId[],
    };
  }

  const enabledAddOns = normalizeEnabledAddOns(
    (deploymentConfigResult.data as DeploymentConfigRow | null)?.enabled_add_ons,
  );

  return {
    check: evaluateSeededRows({
      hasBusinessProfile: Boolean(businessProfileResult.data),
      hasDeploymentConfig: Boolean(deploymentConfigResult.data),
      actualFixedSectionKeys: ((fixedSectionsResult.data ?? []) as Array<{ section_key: FixedSectionKey }>).map(
        (row) => row.section_key,
      ),
      actualManagedSectionKeys: ((managedSectionsResult.data ?? []) as Array<{
        section_key: ManagedSectionKey;
      }>).map((row) => row.section_key),
      expectedFixedSectionKeys: getExpectedFixedSectionKeys(),
      expectedManagedSectionKeys: getExpectedManagedSectionKeys(),
    }),
    enabledAddOns,
    notificationProvider:
      (deploymentConfigResult.data as DeploymentConfigRow | null)?.notification_provider ?? null,
  };
};

const checkStorageBucket = async ({
  supabase,
  enabledAddOns,
}: {
  supabase: ReturnType<typeof createSupabaseClient>;
  enabledAddOns: AddOnId[];
}) => {
  if (!enabledAddOns.includes("beforeAfterGallery")) {
    return createCheck(
      "storage-bucket",
      "pass",
      "Before/after gallery add-on is disabled; site-media bucket is not required.",
    );
  }

  const { data, error } = await supabase.storage.getBucket(SITE_MEDIA_BUCKET);

  if (error) {
    return createCheck(
      "storage-bucket",
      "fail",
      "Required site-media bucket is missing or unreachable.",
      [error.message],
    );
  }

  if (!data) {
    return createCheck("storage-bucket", "fail", "Required site-media bucket was not found.");
  }

  if (!data.public) {
    return createCheck(
      "storage-bucket",
      "fail",
      "Required site-media bucket exists but is not public.",
    );
  }

  return createCheck(
    "storage-bucket",
    "pass",
    "Required site-media bucket exists and is public.",
  );
};

const checkNotificationFunction = async ({
  enabledAddOns,
}: {
  enabledAddOns: AddOnId[];
}) => {
  if (!enabledAddOns.includes("notifications")) {
    return createCheck(
      "notification-function",
      "pass",
      "Notifications add-on is disabled; notification Edge Function is not required.",
    );
  }

  const response = await fetch(`${resolvedSupabaseUrl}/functions/v1/process-appointment-notifications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.supabaseServiceRoleKey?.trim() ?? ""}`,
      apikey: env.supabaseServiceRoleKey?.trim() ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (response.status === 400) {
    return createCheck(
      "notification-function",
      "pass",
      "Notification Edge Function is deployed and reachable.",
    );
  }

  const responseText = await response.text();

  return createCheck(
    "notification-function",
    "fail",
    "Notification Edge Function is not ready.",
    [`HTTP ${response.status}`, responseText.slice(0, 240)],
  );
};

const run = async () => {
  const checks: PreflightCheck[] = [
    evaluateBrowserEnv(env),
    evaluateServiceEnv(env),
  ];

  const serviceEnvReady = checks.every(
    (check) => check.id !== "service-env" || check.status === "pass",
  );

  if (!serviceEnvReady) {
    checks.push(
      createCheck(
        "core-tables",
        "fail",
        "Cannot verify Supabase tables because service env is incomplete.",
      ),
      createCheck(
        "seeded-site-rows",
        "fail",
        "Cannot verify seeded site rows because service env is incomplete.",
      ),
      createCheck(
        "storage-bucket",
        "fail",
        "Cannot verify storage bucket because service env is incomplete.",
      ),
      createCheck(
        "notifications-env",
        "fail",
        "Cannot verify notification readiness because Supabase service env is incomplete. Deployment config will be checked after Supabase is reachable.",
      ),
      createCheck(
        "notification-function",
        "fail",
        "Cannot verify notification Edge Function because Supabase service env is incomplete.",
      ),
    );
  } else {
    const supabase = createSupabaseClient();
    const coreTablesCheck = await checkCoreTables(supabase);
    checks.push(coreTablesCheck);

    if (coreTablesCheck.status === "pass") {
      const { check: seededRowsCheck, enabledAddOns, notificationProvider } = await checkSeededRows(supabase);
      checks.push(seededRowsCheck);
      checks.push(await checkStorageBucket({ supabase, enabledAddOns }));
      checks.push(evaluateNotificationEnv({ enabledAddOns, notificationProvider, env }));

      try {
        checks.push(await checkNotificationFunction({ enabledAddOns }));
      } catch (error) {
        checks.push(
          createCheck(
            "notification-function",
            "fail",
            "Notification Edge Function is not reachable.",
            [error instanceof Error ? error.message : "Unknown Edge Function check error."],
          ),
        );
      }
    } else {
      checks.push(
        createCheck(
          "seeded-site-rows",
          "fail",
          "Cannot verify seeded site rows because core tables are not ready.",
        ),
        createCheck(
          "storage-bucket",
          "fail",
          "Cannot verify storage bucket because core tables are not ready.",
        ),
        createCheck(
          "notifications-env",
          "fail",
          "Cannot verify notification readiness because Supabase service env is incomplete. Deployment config will be checked after Supabase is reachable.",
        ),
        createCheck(
          "notification-function",
          "fail",
          "Cannot verify notification Edge Function because deployment_config is not readable yet.",
        ),
      );
    }
  }

  const summary = summarizePreflightChecks(checks);

  console.log("Site preflight report");
  console.log("=====================");
  for (const check of checks) {
    formatPreflightCheck(check).forEach((line) => console.log(line));
  }
  console.log("---------------------");
  console.log(
    `Summary: ${summary.passed} passed, ${summary.warned} warned, ${summary.failed} failed.`,
  );

  if (summary.shouldFail) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error("Failed to run site preflight.", error);
  process.exitCode = 1;
});

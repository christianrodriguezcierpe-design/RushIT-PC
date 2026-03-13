/* global Deno */

import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@7";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (request: Request) => Promise<Response> | Response): void;
};

type NotificationEventType = "admin_new_request" | "customer_accepted" | "customer_rejected";
type NotificationDeliveryStatus = "pending" | "sent" | "failed" | "skipped";
type NotificationProviderId = "postmark" | "smtp";

interface ProcessRequestBody {
  appointmentRequestId?: string;
}

interface AppointmentRequestRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_label: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: "submitted" | "accepted" | "rejected";
}

interface BusinessProfileRow {
  id: "default";
  name: string;
  email: string;
  phone_label: string;
}

interface DeploymentConfigRow {
  id: "default";
  enabled_add_ons: string[];
  notification_provider?: NotificationProviderId | null;
}

interface NotificationLogRow {
  id: string;
  appointment_request_id: string;
  event_type: NotificationEventType;
  recipient: string | null;
  status: NotificationDeliveryStatus;
  payload: Record<string, unknown>;
}

interface NotificationEmailContent {
  subject: string;
  htmlBody: string;
  textBody: string;
}

interface PostmarkResponseBody {
  ErrorCode?: number;
  Message?: string;
  MessageID?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const postmarkServerToken = Deno.env.get("POSTMARK_SERVER_TOKEN");
const postmarkFromEmail = Deno.env.get("POSTMARK_FROM_EMAIL");
const postmarkFromName = Deno.env.get("POSTMARK_FROM_NAME");
const smtpHost = Deno.env.get("SMTP_HOST");
const smtpPort = Deno.env.get("SMTP_PORT");
const smtpUsername = Deno.env.get("SMTP_USERNAME");
const smtpPassword = Deno.env.get("SMTP_PASSWORD");
const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL");
const smtpFromName = Deno.env.get("SMTP_FROM_NAME");
const smtpSecure = Deno.env.get("SMTP_SECURE");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for notification processing.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const normalizeProvider = (value: unknown): NotificationProviderId =>
  value === "smtp" ? "smtp" : "postmark";

const formatSender = (provider: NotificationProviderId) => {
  if (provider === "smtp") {
    if (smtpFromName && smtpFromEmail) {
      return `${smtpFromName} <${smtpFromEmail}>`;
    }

    return smtpFromEmail ?? "";
  }

  if (postmarkFromName && postmarkFromEmail) {
    return `${postmarkFromName} <${postmarkFromEmail}>`;
  }

  return postmarkFromEmail ?? "";
};

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const formatHumanDateTime = (dateValue: string, timeValue: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(`${dateValue}T${timeValue}`));
  } catch {
    return `${dateValue} ${timeValue}`;
  }
};

const parseSmtpPort = () => {
  const parsedPort = Number.parseInt(smtpPort?.trim() ?? "", 10);
  return Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : null;
};

const parseSmtpSecure = (port: number) => {
  const normalizedValue = smtpSecure?.trim().toLowerCase();

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  return port === 465;
};

const getProviderConfigError = (provider: NotificationProviderId) => {
  if (provider === "smtp") {
    const resolvedPort = parseSmtpPort();

    if (!smtpHost || !resolvedPort || !smtpUsername || !smtpPassword || !smtpFromEmail) {
      return "SMTP is enabled but host, port, credentials, or sender email is missing.";
    }

    return null;
  }

  if (!postmarkServerToken || !postmarkFromEmail) {
    return "Postmark is enabled but server token or sender email is missing.";
  }

  return null;
};

const buildNotificationContent = (
  notification: NotificationLogRow,
  appointmentRequest: AppointmentRequestRow,
  businessProfile: BusinessProfileRow,
): NotificationEmailContent => {
  const businessName = businessProfile.name;
  const customerName = appointmentRequest.customer_name;
  const requestedSlot = formatHumanDateTime(
    appointmentRequest.preferred_date,
    appointmentRequest.preferred_time,
  );

  switch (notification.event_type) {
    case "admin_new_request": {
      return {
        subject: `${businessName}: new appointment request from ${customerName}`,
        htmlBody: `
          <h1>New appointment request</h1>
          <p><strong>${escapeHtml(customerName)}</strong> requested <strong>${escapeHtml(appointmentRequest.service_label)}</strong>.</p>
          <p>Preferred time: ${escapeHtml(requestedSlot)}</p>
          <p>Email: ${escapeHtml(appointmentRequest.customer_email)}</p>
          <p>Phone: ${escapeHtml(appointmentRequest.customer_phone)}</p>
          <p>Message:</p>
          <p>${escapeHtml(appointmentRequest.message || "No additional details provided.")}</p>
        `,
        textBody: [
          "New appointment request",
          `${customerName} requested ${appointmentRequest.service_label}.`,
          `Preferred time: ${requestedSlot}`,
          `Email: ${appointmentRequest.customer_email}`,
          `Phone: ${appointmentRequest.customer_phone}`,
          `Message: ${appointmentRequest.message || "No additional details provided."}`,
        ].join("\n"),
      };
    }
    case "customer_accepted": {
      return {
        subject: `${businessName}: your appointment request was accepted`,
        htmlBody: `
          <h1>Your request was accepted</h1>
          <p>Hi ${escapeHtml(customerName)},</p>
          <p>${escapeHtml(businessName)} accepted your request for <strong>${escapeHtml(appointmentRequest.service_label)}</strong>.</p>
          <p>Requested time: ${escapeHtml(requestedSlot)}</p>
          <p>If you need anything before the appointment, reply to ${escapeHtml(businessProfile.email)} or call ${escapeHtml(businessProfile.phone_label)}.</p>
        `,
        textBody: [
          `Hi ${customerName},`,
          `${businessName} accepted your request for ${appointmentRequest.service_label}.`,
          `Requested time: ${requestedSlot}`,
          `Questions? Email ${businessProfile.email} or call ${businessProfile.phone_label}.`,
        ].join("\n"),
      };
    }
    case "customer_rejected":
    default: {
      return {
        subject: `${businessName}: update on your appointment request`,
        htmlBody: `
          <h1>Request update</h1>
          <p>Hi ${escapeHtml(customerName)},</p>
          <p>${escapeHtml(businessName)} reviewed your request for <strong>${escapeHtml(appointmentRequest.service_label)}</strong>.</p>
          <p>They are not able to accept the requested time right now.</p>
          <p>Please reply to ${escapeHtml(businessProfile.email)} or call ${escapeHtml(businessProfile.phone_label)} to discuss another option.</p>
        `,
        textBody: [
          `Hi ${customerName},`,
          `${businessName} reviewed your request for ${appointmentRequest.service_label}.`,
          "They are not able to accept the requested time right now.",
          `Please reply to ${businessProfile.email} or call ${businessProfile.phone_label} to discuss another option.`,
        ].join("\n"),
      };
    }
  }
};

const updateNotificationLog = async (
  notificationLogId: string,
  values: Partial<{
    status: NotificationDeliveryStatus;
    provider: NotificationProviderId;
    provider_message_id: string | null;
    error_message: string | null;
  }>,
) => {
  const { error } = await supabase.from("notification_logs").update(values).eq("id", notificationLogId);

  if (error) {
    throw error;
  }
};

const sendViaPostmark = async ({
  recipient,
  emailContent,
}: {
  recipient: string;
  emailContent: NotificationEmailContent;
}) => {
  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": postmarkServerToken ?? "",
    },
    body: JSON.stringify({
      From: formatSender("postmark"),
      To: recipient,
      Subject: emailContent.subject,
      HtmlBody: emailContent.htmlBody,
      TextBody: emailContent.textBody,
    }),
  });

  let responseBody: PostmarkResponseBody = {};

  try {
    responseBody = (await response.json()) as PostmarkResponseBody;
  } catch {
    responseBody = {};
  }

  if (!response.ok || (responseBody.ErrorCode ?? 0) !== 0) {
    throw new Error(responseBody.Message ?? `Postmark send failed with HTTP ${response.status}.`);
  }

  return responseBody.MessageID ?? null;
};

const sendViaSmtp = async ({
  recipient,
  emailContent,
}: {
  recipient: string;
  emailContent: NotificationEmailContent;
}) => {
  const resolvedPort = parseSmtpPort();

  if (!smtpHost || !resolvedPort || !smtpUsername || !smtpPassword || !smtpFromEmail) {
    throw new Error("SMTP is enabled but host, port, credentials, or sender email is missing.");
  }

  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: resolvedPort,
    secure: parseSmtpSecure(resolvedPort),
    auth: {
      user: smtpUsername,
      pass: smtpPassword,
    },
  });

  try {
    const response = await transport.sendMail({
      from: formatSender("smtp"),
      to: recipient,
      subject: emailContent.subject,
      html: emailContent.htmlBody,
      text: emailContent.textBody,
    });

    return response.messageId ?? null;
  } finally {
    transport.close();
  }
};

const sendNotification = async ({
  provider,
  recipient,
  emailContent,
}: {
  provider: NotificationProviderId;
  recipient: string;
  emailContent: NotificationEmailContent;
}) => {
  if (provider === "smtp") {
    return sendViaSmtp({ recipient, emailContent });
  }

  return sendViaPostmark({ recipient, emailContent });
};

const processPendingNotifications = async (appointmentRequestId: string) => {
  const [deploymentConfigResult, businessProfileResult, appointmentRequestResult, notificationsResult] =
    await Promise.all([
      supabase
        .from("deployment_config")
        .select("id, enabled_add_ons, notification_provider")
        .eq("id", "default")
        .maybeSingle(),
      supabase
        .from("business_profile")
        .select("id, name, email, phone_label")
        .eq("id", "default")
        .maybeSingle(),
      supabase
        .from("appointment_requests")
        .select("id, customer_name, customer_email, customer_phone, service_label, preferred_date, preferred_time, message, status")
        .eq("id", appointmentRequestId)
        .maybeSingle(),
      supabase
        .from("notification_logs")
        .select("id, appointment_request_id, event_type, recipient, status, payload")
        .eq("appointment_request_id", appointmentRequestId)
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
    ]);

  if (deploymentConfigResult.error) {
    throw deploymentConfigResult.error;
  }

  if (businessProfileResult.error) {
    throw businessProfileResult.error;
  }

  if (appointmentRequestResult.error) {
    throw appointmentRequestResult.error;
  }

  if (notificationsResult.error) {
    throw notificationsResult.error;
  }

  const deploymentConfig = deploymentConfigResult.data as DeploymentConfigRow | null;
  const businessProfile = businessProfileResult.data as BusinessProfileRow | null;
  const appointmentRequest = appointmentRequestResult.data as AppointmentRequestRow | null;
  const pendingNotifications = (notificationsResult.data ?? []) as NotificationLogRow[];

  if (!appointmentRequest || !businessProfile || !deploymentConfig || pendingNotifications.length === 0) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };
  }

  const notificationProvider = normalizeProvider(deploymentConfig.notification_provider);
  const notificationsEnabled = deploymentConfig.enabled_add_ons.includes("notifications");

  if (!notificationsEnabled) {
    await Promise.all(
      pendingNotifications.map((notification) =>
        updateNotificationLog(notification.id, {
          status: "skipped",
          provider: notificationProvider,
          error_message: "Notification add-on is not enabled for this deployment.",
          provider_message_id: null,
        }),
      ),
    );

    return {
      processed: pendingNotifications.length,
      sent: 0,
      failed: 0,
      skipped: pendingNotifications.length,
    };
  }

  const providerConfigError = getProviderConfigError(notificationProvider);

  if (providerConfigError) {
    await Promise.all(
      pendingNotifications.map((notification) =>
        updateNotificationLog(notification.id, {
          status: "failed",
          provider: notificationProvider,
          error_message: providerConfigError,
          provider_message_id: null,
        }),
      ),
    );

    return {
      processed: pendingNotifications.length,
      sent: 0,
      failed: pendingNotifications.length,
      skipped: 0,
    };
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const notification of pendingNotifications) {
    if (!notification.recipient) {
      await updateNotificationLog(notification.id, {
        status: "skipped",
        provider: notificationProvider,
        error_message: "Missing recipient email.",
        provider_message_id: null,
      });
      skipped += 1;
      continue;
    }

    const emailContent = buildNotificationContent(notification, appointmentRequest, businessProfile);

    try {
      const providerMessageId = await sendNotification({
        provider: notificationProvider,
        recipient: notification.recipient,
        emailContent,
      });

      await updateNotificationLog(notification.id, {
        status: "sent",
        provider: notificationProvider,
        error_message: null,
        provider_message_id: providerMessageId,
      });
      sent += 1;
    } catch (error) {
      await updateNotificationLog(notification.id, {
        status: "failed",
        provider: notificationProvider,
        error_message:
          error instanceof Error
            ? error.message
            : `Unknown ${notificationProvider.toUpperCase()} send error.`,
        provider_message_id: null,
      });
      failed += 1;
    }
  }

  return {
    processed: pendingNotifications.length,
    sent,
    failed,
    skipped,
  };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { appointmentRequestId } = (await request.json()) as ProcessRequestBody;

    if (!appointmentRequestId) {
      return new Response(JSON.stringify({ error: "appointmentRequestId is required." }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const result = await processPendingNotifications(appointmentRequestId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown notification processing error.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

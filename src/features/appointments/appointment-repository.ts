import { processAppointmentNotifications } from "@/features/notifications/notification-dispatcher";
import { hasEnabledAddOn } from "@/features/site/site-runtime";
import { loadSiteDefinition } from "@/features/site/site-repository";
import { getSupabaseBrowserClient } from "@/integrations/supabase/client";
import type {
  AppointmentRequest,
  AppointmentRequestInput,
  AppointmentRequestNote,
  AppointmentRequestStatus,
  AppointmentWorkflowRecord,
  NotificationEventType,
  NotificationLog,
} from "@/types/appointment";
import type { NotificationProviderId } from "@/types/site";

interface AppointmentRequestRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_key: string;
  service_label: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: AppointmentRequestStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

interface AppointmentRequestNoteRow {
  id: string;
  appointment_request_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
}

interface NotificationLogRow {
  id: string;
  appointment_request_id: string;
  event_type: NotificationEventType;
  channel: "email";
  recipient: string | null;
  status: NotificationLog["status"];
  provider: string | null;
  provider_message_id: string | null;
  error_message: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface LocalAppointmentStore {
  requests: AppointmentRequest[];
  notes: AppointmentRequestNote[];
  notifications: NotificationLog[];
}

const LOCAL_STORAGE_KEY = "service-biz:appointment-workflow";

const clone = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};

const mapAppointmentRequestRow = (row: AppointmentRequestRow): AppointmentRequest => {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    serviceKey: row.service_key,
    serviceLabel: row.service_label,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    message: row.message,
    status: row.status,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapAppointmentRequestNoteRow = (row: AppointmentRequestNoteRow): AppointmentRequestNote => {
  return {
    id: row.id,
    appointmentRequestId: row.appointment_request_id,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
};

const mapNotificationLogRow = (row: NotificationLogRow): NotificationLog => {
  return {
    id: row.id,
    appointmentRequestId: row.appointment_request_id,
    eventType: row.event_type,
    channel: row.channel,
    recipient: row.recipient,
    status: row.status,
    provider: row.provider,
    providerMessageId: row.provider_message_id,
    errorMessage: row.error_message,
    payload: row.payload,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const buildWorkflowRecords = (
  requests: AppointmentRequest[],
  notes: AppointmentRequestNote[],
  notifications: NotificationLog[],
): AppointmentWorkflowRecord[] => {
  return requests.map((request) => ({
    request,
    notes: notes.filter((note) => note.appointmentRequestId === request.id),
    notifications: notifications.filter((notification) => notification.appointmentRequestId === request.id),
  }));
};

const getDefaultLocalStore = (): LocalAppointmentStore => ({
  requests: [],
  notes: [],
  notifications: [],
});

const isBrowser = () => typeof window !== "undefined";

const readLocalStore = (): LocalAppointmentStore => {
  if (!isBrowser()) {
    return getDefaultLocalStore();
  }

  const rawValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!rawValue) {
    return getDefaultLocalStore();
  }

  try {
    const parsedValue = JSON.parse(rawValue) as LocalAppointmentStore;

    return {
      requests: parsedValue.requests ?? [],
      notes: parsedValue.notes ?? [],
      notifications: parsedValue.notifications ?? [],
    };
  } catch {
    return getDefaultLocalStore();
  }
};

const writeLocalStore = (store: LocalAppointmentStore) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
};

const createLocalNotification = (
  notificationsEnabled: boolean,
  notificationProvider: NotificationProviderId,
  businessEmail: string,
  appointmentRequest: AppointmentRequest,
  eventType: NotificationEventType,
): NotificationLog => {
  const recipient =
    eventType === "admin_new_request" ? businessEmail : appointmentRequest.customerEmail;
  const status: NotificationLog["status"] = !recipient
    ? "skipped"
    : notificationsEnabled
      ? "failed"
      : "skipped";
  const errorMessage = !recipient
    ? "Missing recipient email."
    : notificationsEnabled
      ? `Email delivery is unavailable in local mode. Configure Supabase and ${
          notificationProvider === "smtp" ? "SMTP" : "Postmark"
        } to send notifications.`
      : "Notification add-on is not enabled for this deployment.";

  return {
    id: crypto.randomUUID(),
    appointmentRequestId: appointmentRequest.id,
    eventType,
    channel: "email",
    recipient,
    status,
    provider: notificationProvider,
    providerMessageId: null,
    errorMessage,
    payload:
      eventType === "admin_new_request"
        ? {
            customerName: appointmentRequest.customerName,
            customerEmail: appointmentRequest.customerEmail,
            serviceLabel: appointmentRequest.serviceLabel,
            preferredDate: appointmentRequest.preferredDate,
            preferredTime: appointmentRequest.preferredTime,
            message: appointmentRequest.message,
          }
        : {
            customerName: appointmentRequest.customerName,
            serviceLabel: appointmentRequest.serviceLabel,
            status: appointmentRequest.status,
          },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const attemptNotificationDispatch = async (appointmentRequestId: string) => {
  try {
    await processAppointmentNotifications(appointmentRequestId);
  } catch (error) {
    console.error("Unable to process appointment notifications.", error);
  }
};

const createLocalAppointmentRequest = (input: AppointmentRequestInput): AppointmentRequest => {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    serviceKey: input.serviceKey,
    serviceLabel: input.serviceLabel,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    message: input.message,
    status: "submitted",
    reviewedAt: null,
    reviewedBy: null,
    createdAt: now,
    updatedAt: now,
  };
};

const getSupabaseAppointmentWorkflow = async (): Promise<AppointmentWorkflowRecord[] | null> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const [requestsResult, notesResult, notificationsResult] = await Promise.all([
    supabase.from("appointment_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("appointment_request_notes").select("*").order("created_at", { ascending: true }),
    supabase.from("notification_logs").select("*").order("created_at", { ascending: false }),
  ]);

  if (requestsResult.error || notesResult.error || notificationsResult.error) {
    return null;
  }

  const requests = (requestsResult.data as AppointmentRequestRow[]).map(mapAppointmentRequestRow);
  const notes = (notesResult.data as AppointmentRequestNoteRow[]).map(mapAppointmentRequestNoteRow);
  const notifications = (notificationsResult.data as NotificationLogRow[]).map(mapNotificationLogRow);

  return buildWorkflowRecords(requests, notes, notifications);
};

export const listAppointmentWorkflowRecords = async (): Promise<AppointmentWorkflowRecord[]> => {
  const supabaseWorkflow = await getSupabaseAppointmentWorkflow();

  if (supabaseWorkflow) {
    return supabaseWorkflow;
  }

  const localStore = readLocalStore();
  const requests = [...localStore.requests].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const notes = [...localStore.notes].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  const notifications = [...localStore.notifications].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return buildWorkflowRecords(requests, notes, notifications);
};

export const createAppointmentRequest = async (input: AppointmentRequestInput): Promise<AppointmentRequest> => {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("appointment_requests")
      .insert({
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        service_key: input.serviceKey,
        service_label: input.serviceLabel,
        preferred_date: input.preferredDate,
        preferred_time: input.preferredTime,
        message: input.message,
      })
      .select("*")
      .single();

    if (!error && data) {
      const appointmentRequest = mapAppointmentRequestRow(data as AppointmentRequestRow);
      await attemptNotificationDispatch(appointmentRequest.id);
      return appointmentRequest;
    }
  }

  const localStore = readLocalStore();
  const siteDefinition = await loadSiteDefinition();
  const notificationsEnabled = hasEnabledAddOn(siteDefinition, "notifications");
  const appointmentRequest = createLocalAppointmentRequest(input);
  const adminNotification = createLocalNotification(
    notificationsEnabled,
    siteDefinition.packageConfig.notificationProvider,
    siteDefinition.business.email,
    appointmentRequest,
    "admin_new_request",
  );

  localStore.requests.unshift(appointmentRequest);
  localStore.notifications.unshift(adminNotification);
  writeLocalStore(localStore);

  return appointmentRequest;
};

export const updateAppointmentRequestStatus = async (
  appointmentRequestId: string,
  status: Exclude<AppointmentRequestStatus, "submitted">,
  reviewedBy: string | null,
): Promise<AppointmentRequest> => {
  const supabase = getSupabaseBrowserClient();
  const reviewedAt = new Date().toISOString();

  if (supabase) {
    const { data, error } = await supabase
      .from("appointment_requests")
      .update({
        status,
        reviewed_at: reviewedAt,
        reviewed_by: reviewedBy,
      })
      .eq("id", appointmentRequestId)
      .select("*")
      .single();

    if (!error && data) {
      const appointmentRequest = mapAppointmentRequestRow(data as AppointmentRequestRow);
      await attemptNotificationDispatch(appointmentRequest.id);
      return appointmentRequest;
    }
  }

  const localStore = readLocalStore();
  const siteDefinition = await loadSiteDefinition();
  const notificationsEnabled = hasEnabledAddOn(siteDefinition, "notifications");
  const requestIndex = localStore.requests.findIndex((request) => request.id === appointmentRequestId);

  if (requestIndex === -1) {
    throw new Error("Appointment request not found.");
  }

  const updatedRequest: AppointmentRequest = {
    ...localStore.requests[requestIndex],
    status,
    reviewedAt,
    reviewedBy,
    updatedAt: reviewedAt,
  };

  localStore.requests[requestIndex] = updatedRequest;
  localStore.notifications.unshift(
    createLocalNotification(
      notificationsEnabled,
      siteDefinition.packageConfig.notificationProvider,
      siteDefinition.business.email,
      updatedRequest,
      status === "accepted" ? "customer_accepted" : "customer_rejected",
    ),
  );
  writeLocalStore(localStore);

  return updatedRequest;
};

export const addAppointmentRequestNote = async (
  appointmentRequestId: string,
  note: string,
  createdBy: string | null,
): Promise<AppointmentRequestNote> => {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("appointment_request_notes")
      .insert({
        appointment_request_id: appointmentRequestId,
        note,
        created_by: createdBy,
      })
      .select("*")
      .single();

    if (!error && data) {
      return mapAppointmentRequestNoteRow(data as AppointmentRequestNoteRow);
    }
  }

  const localStore = readLocalStore();
  const nextNote: AppointmentRequestNote = {
    id: crypto.randomUUID(),
    appointmentRequestId,
    note,
    createdBy,
    createdAt: new Date().toISOString(),
  };

  localStore.notes.push(nextNote);
  writeLocalStore(localStore);

  return nextNote;
};

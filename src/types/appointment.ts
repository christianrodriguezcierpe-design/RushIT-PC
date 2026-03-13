import type { NotificationProviderId } from "@/types/site";

export type AppointmentRequestStatus = "submitted" | "accepted" | "rejected";

export type NotificationEventType =
  | "admin_new_request"
  | "customer_accepted"
  | "customer_rejected";

export type NotificationDeliveryStatus = "pending" | "sent" | "failed" | "skipped";

export interface AppointmentRequestInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceKey: string;
  serviceLabel: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

export interface AppointmentRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceKey: string;
  serviceLabel: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: AppointmentRequestStatus;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequestNote {
  id: string;
  appointmentRequestId: string;
  note: string;
  createdBy: string | null;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  appointmentRequestId: string;
  eventType: NotificationEventType;
  channel: "email";
  recipient: string | null;
  status: NotificationDeliveryStatus;
  provider: NotificationProviderId | null;
  providerMessageId: string | null;
  errorMessage: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDispatchResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}

export interface AppointmentWorkflowRecord {
  request: AppointmentRequest;
  notes: AppointmentRequestNote[];
  notifications: NotificationLog[];
}

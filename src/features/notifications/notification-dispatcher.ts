import { getSupabaseBrowserClient } from "@/integrations/supabase/client";
import type { NotificationDispatchResult } from "@/types/appointment";

export const processAppointmentNotifications = async (
  appointmentRequestId: string,
): Promise<NotificationDispatchResult | null> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke("process-appointment-notifications", {
    body: { appointmentRequestId },
  });

  if (error) {
    throw error;
  }

  return (data ?? null) as NotificationDispatchResult | null;
};

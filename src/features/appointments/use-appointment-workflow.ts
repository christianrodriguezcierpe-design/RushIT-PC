import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addAppointmentRequestNote,
  createAppointmentRequest,
  listAppointmentWorkflowRecords,
  updateAppointmentRequestStatus,
} from "@/features/appointments/appointment-repository";
import type { AppointmentRequestInput } from "@/types/appointment";

const APPOINTMENT_WORKFLOW_QUERY_KEY = ["appointment-workflow"];

export const useAppointmentWorkflow = () => {
  return useQuery({
    queryKey: APPOINTMENT_WORKFLOW_QUERY_KEY,
    queryFn: listAppointmentWorkflowRecords,
  });
};

export const useCreateAppointmentRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AppointmentRequestInput) => createAppointmentRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_WORKFLOW_QUERY_KEY });
    },
  });
};

export const useUpdateAppointmentRequestStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentRequestId,
      status,
      reviewedBy,
    }: {
      appointmentRequestId: string;
      status: "accepted" | "rejected";
      reviewedBy: string | null;
    }) => updateAppointmentRequestStatus(appointmentRequestId, status, reviewedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_WORKFLOW_QUERY_KEY });
    },
  });
};

export const useAddAppointmentRequestNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentRequestId,
      note,
      createdBy,
    }: {
      appointmentRequestId: string;
      note: string;
      createdBy: string | null;
    }) => addAppointmentRequestNote(appointmentRequestId, note, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_WORKFLOW_QUERY_KEY });
    },
  });
};

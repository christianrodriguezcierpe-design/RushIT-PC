import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { Inbox, LogOut, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import BusinessProfileEditor from "@/components/admin/BusinessProfileEditor";
import BeforeAfterGalleryEditor from "@/components/admin/BeforeAfterGalleryEditor";
import CaseStudiesEditor from "@/components/admin/CaseStudiesEditor";
import FaqEditor from "@/components/admin/FaqEditor";
import ManagedSectionOrderEditor from "@/components/admin/ManagedSectionOrderEditor";
import PricingEditor from "@/components/admin/PricingEditor";
import ReviewsEditor from "@/components/admin/ReviewsEditor";
import ServicesEditor from "@/components/admin/ServicesEditor";
import TeamEditor from "@/components/admin/TeamEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddAppointmentRequestNoteMutation,
  useAppointmentWorkflow,
  useUpdateAppointmentRequestStatusMutation,
} from "@/features/appointments/use-appointment-workflow";
import { useAdminSession } from "@/features/auth/use-admin-session";
import { hasEnabledAddOn, isManagedSectionAllowed } from "@/features/site/site-runtime";
import { useSiteDefinition } from "@/features/site/use-site-definition";
import type { AppointmentRequestStatus } from "@/types/appointment";

const getStatusBadgeVariant = (status: AppointmentRequestStatus) => {
  switch (status) {
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

const formatDateTime = (dateValue: string, timeValue: string) => {
  try {
    return format(new Date(`${dateValue}T${timeValue}`), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return `${dateValue} ${timeValue}`;
  }
};

const formatTimestamp = (value: string) => {
  try {
    return format(new Date(value), "MMM d, yyyy h:mm a");
  } catch {
    return value;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: workflowRecords = [], isLoading, isError } = useAppointmentWorkflow();
  const {
    data: siteDefinition,
    isLoading: isSiteLoading,
    isError: isSiteError,
  } = useSiteDefinition();
  const { isLocalMode, signOut, user } = useAdminSession();
  const updateStatusMutation = useUpdateAppointmentRequestStatusMutation();
  const addNoteMutation = useAddAppointmentRequestNoteMutation();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    if (!selectedRequestId && workflowRecords.length > 0) {
      setSelectedRequestId(workflowRecords[0].request.id);
      return;
    }

    if (
      selectedRequestId &&
      workflowRecords.length > 0 &&
      !workflowRecords.some((record) => record.request.id === selectedRequestId)
    ) {
      setSelectedRequestId(workflowRecords[0].request.id);
    }
  }, [selectedRequestId, workflowRecords]);

  const selectedRecord =
    workflowRecords.find((record) => record.request.id === selectedRequestId) ??
    workflowRecords[0] ??
    null;

  const submittedCount = workflowRecords.filter((record) => record.request.status === "submitted").length;
  const acceptedCount = workflowRecords.filter((record) => record.request.status === "accepted").length;
  const rejectedCount = workflowRecords.filter((record) => record.request.status === "rejected").length;
  const allowedManagedSections = siteDefinition
    ? siteDefinition.landing.managedSections.filter((section) =>
        siteDefinition.packageConfig.allowedManagedSections.includes(section.key),
      )
    : [];
  const canManagePricing = siteDefinition
    ? isManagedSectionAllowed(siteDefinition, "pricing") &&
      hasEnabledAddOn(siteDefinition, "pricing") &&
      siteDefinition.adminExperience.allowedCollections.includes("pricingTiers")
    : false;
  const canManageTeam = siteDefinition
    ? isManagedSectionAllowed(siteDefinition, "team") &&
      hasEnabledAddOn(siteDefinition, "team") &&
      siteDefinition.adminExperience.allowedCollections.includes("teamMembers")
    : false;
  const canManageBeforeAfterGallery = siteDefinition
    ? isManagedSectionAllowed(siteDefinition, "beforeAfterGallery") &&
      hasEnabledAddOn(siteDefinition, "beforeAfterGallery") &&
      siteDefinition.adminExperience.allowedCollections.includes("beforeAfterItems")
    : false;
  const canManageCaseStudies = siteDefinition
    ? isManagedSectionAllowed(siteDefinition, "caseStudies") &&
      hasEnabledAddOn(siteDefinition, "caseStudies") &&
      siteDefinition.adminExperience.allowedCollections.includes("caseStudies")
    : false;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign out.";
      toast.error(message);
    }
  };

  const handleDecision = async (status: "accepted" | "rejected") => {
    if (!selectedRecord) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        appointmentRequestId: selectedRecord.request.id,
        status,
        reviewedBy: user?.id ?? null,
      });
      toast.success(`Request ${status}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update the request.";
      toast.error(message);
    }
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedRecord || !noteDraft.trim()) {
      return;
    }

    try {
      await addNoteMutation.mutateAsync({
        appointmentRequestId: selectedRecord.request.id,
        note: noteDraft.trim(),
        createdBy: user?.id ?? null,
      });
      setNoteDraft("");
      toast.success("Note added.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save the note.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold text-foreground">Business admin</h1>
              <Badge variant={isLocalMode ? "outline" : "secondary"}>
                {isLocalMode ? "Local mode" : "Supabase auth"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage appointment requests and update the business-facing content included in the active package.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/">View site</Link>
            </Button>
            {!isLocalMode ? (
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            ) : null}
          </div>
        </div>

        {isLocalMode ? (
          <Card className="border-dashed border-primary/40 bg-primary/5">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Local mode is active because Supabase auth is not configured in this workspace. Request data and content edits are stored locally until a real client project is connected.
            </CardContent>
          </Card>
        ) : null}

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Submitted</CardDescription>
                  <CardTitle className="font-display text-3xl">{submittedCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Accepted</CardDescription>
                  <CardTitle className="font-display text-3xl">{acceptedCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Rejected</CardDescription>
                  <CardTitle className="font-display text-3xl">{rejectedCount}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Queue</CardTitle>
                  <CardDescription>Newest requests appear first.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading requests...</p>
                  ) : null}

                  {isError ? (
                    <p className="text-sm text-destructive">The request queue could not be loaded.</p>
                  ) : null}

                  {!isLoading && !isError && workflowRecords.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No appointment requests yet.</p>
                    </div>
                  ) : null}

                  {workflowRecords.map((record) => (
                    <button
                      key={record.request.id}
                      type="button"
                      onClick={() => setSelectedRequestId(record.request.id)}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${
                        selectedRecord?.request.id === record.request.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-base font-bold text-foreground">
                            {record.request.customerName}
                          </p>
                          <p className="text-sm text-muted-foreground">{record.request.serviceLabel}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(record.request.status)}>
                          {record.request.status}
                        </Badge>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {formatDateTime(record.request.preferredDate, record.request.preferredTime)}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-2xl">
                    {selectedRecord ? selectedRecord.request.customerName : "Request details"}
                  </CardTitle>
                  <CardDescription>
                    {selectedRecord
                      ? `Submitted ${formatTimestamp(selectedRecord.request.createdAt)}`
                      : "Select a request from the queue to review it."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedRecord ? (
                    <p className="text-sm text-muted-foreground">No request selected.</p>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border bg-background p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
                          <div className="mt-3 space-y-2 text-sm text-foreground">
                            <p className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-primary" />
                              {selectedRecord.request.customerEmail}
                            </p>
                            <p className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-primary" />
                              {selectedRecord.request.customerPhone}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requested slot</p>
                          <p className="mt-3 text-sm text-foreground">
                            {formatDateTime(selectedRecord.request.preferredDate, selectedRecord.request.preferredTime)}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">{selectedRecord.request.serviceLabel}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border bg-background p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current status</p>
                            <div className="mt-2">
                              <Badge variant={getStatusBadgeVariant(selectedRecord.request.status)}>
                                {selectedRecord.request.status}
                              </Badge>
                            </div>
                          </div>
                          {selectedRecord.request.status === "submitted" ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleDecision("accepted")}
                                disabled={updateStatusMutation.isPending}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDecision("rejected")}
                                disabled={updateStatusMutation.isPending}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-xl border bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer message</p>
                        <p className="mt-3 text-sm text-foreground">
                          {selectedRecord.request.message || "No additional details were provided."}
                        </p>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border bg-background p-4">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Internal notes</p>
                            <Badge variant="outline">{selectedRecord.notes.length}</Badge>
                          </div>

                          <div className="space-y-3">
                            {selectedRecord.notes.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No notes yet.</p>
                            ) : (
                              selectedRecord.notes.map((note) => (
                                <div key={note.id} className="rounded-lg border p-3">
                                  <p className="text-sm text-foreground">{note.note}</p>
                                  <p className="mt-2 text-xs text-muted-foreground">{formatTimestamp(note.createdAt)}</p>
                                </div>
                              ))
                            )}
                          </div>

                          <form onSubmit={handleAddNote} className="mt-4 space-y-3">
                            <Textarea
                              placeholder="Add a follow-up note for the business..."
                              value={noteDraft}
                              onChange={(event) => setNoteDraft(event.target.value)}
                              rows={4}
                            />
                            <Button type="submit" disabled={addNoteMutation.isPending || !noteDraft.trim()}>
                              Save note
                            </Button>
                          </form>
                        </div>

                        <div className="rounded-xl border bg-background p-4">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notification log</p>
                            <Badge variant="outline">{selectedRecord.notifications.length}</Badge>
                          </div>

                          <div className="space-y-3">
                            {selectedRecord.notifications.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No notification events logged yet.</p>
                            ) : (
                              selectedRecord.notifications.map((notification) => (
                                <div key={notification.id} className="rounded-lg border p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-foreground">{notification.eventType}</p>
                                    <Badge
                                      variant={
                                        notification.status === "pending"
                                          ? "secondary"
                                          : notification.status === "sent"
                                            ? "default"
                                            : "outline"
                                      }
                                    >
                                      {notification.status}
                                    </Badge>
                                  </div>
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    Recipient: {notification.recipient ?? "missing"}
                                  </p>
                                  {notification.errorMessage ? (
                                    <p className="mt-1 text-xs text-destructive">{notification.errorMessage}</p>
                                  ) : null}
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {formatTimestamp(notification.createdAt)}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Business content</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update business-facing content and constrained presentation order without changing package structure.
              </p>
            </div>

            {isSiteLoading ? (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  Loading site content...
                </CardContent>
              </Card>
            ) : null}

            {isSiteError ? (
              <Card>
                <CardContent className="pt-6 text-sm text-destructive">
                  The site definition could not be loaded.
                </CardContent>
              </Card>
            ) : null}

            {siteDefinition ? (
              <div className="space-y-6">
                <BusinessProfileEditor businessProfile={siteDefinition.business} />
                <ManagedSectionOrderEditor
                  sections={allowedManagedSections}
                  canReorder={siteDefinition.adminExperience.canReorderManagedSections}
                />
                <ServicesEditor content={siteDefinition.landing.managedContent.services} />
                {canManagePricing ? (
                  <PricingEditor content={siteDefinition.landing.managedContent.pricing} />
                ) : null}
                {canManageBeforeAfterGallery ? (
                  <BeforeAfterGalleryEditor content={siteDefinition.landing.managedContent.beforeAfterGallery} />
                ) : null}
                <FaqEditor content={siteDefinition.landing.managedContent.faq} />
                <ReviewsEditor content={siteDefinition.landing.managedContent.reviews} />
                {canManageTeam ? (
                  <TeamEditor content={siteDefinition.landing.managedContent.team} />
                ) : null}
                {canManageCaseStudies ? (
                  <CaseStudiesEditor content={siteDefinition.landing.managedContent.caseStudies} />
                ) : null}
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminSession } from "@/features/auth/use-admin-session";

const AdminLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isLocalMode, signInWithPassword } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = typeof location.state?.from === "string" ? location.state.from : "/admin";

  if (!isLocalMode && isAuthenticated) {
    return <Navigate to={nextPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await signInWithPassword(email, password);
      toast.success("Signed in.");
      navigate(nextPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">Loading admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:grid lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-primary/20 bg-card/90">
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              Admin access
            </Badge>
            <CardTitle className="font-display text-3xl">Business admin login</CardTitle>
            <CardDescription>
              Review appointment requests, update statuses, and manage follow-up notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This V1 admin shell is scoped to request operations and business-facing content controls. Package activation and add-on controls remain outside the client app.
            </p>
            <p>
              {isLocalMode
                ? "Supabase auth is not configured in this workspace, so the admin dashboard is available in local mode for UI development."
                : "Use the email and password created in the client's Supabase Auth users list."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/">Back to site</Link>
              </Button>
              {isLocalMode ? (
                <Button asChild>
                  <Link to="/admin">Open local admin mode</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Sign in</CardTitle>
            <CardDescription>
              {isLocalMode ? "Authentication is bypassed locally until Supabase is configured." : "Enter the business admin credentials."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLocalMode ? (
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Local mode keeps the admin UI accessible without a connected Supabase project.</p>
                <Button asChild className="w-full">
                  <Link to="/admin">Continue to dashboard</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="admin@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;

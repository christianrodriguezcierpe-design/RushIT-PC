import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdminSession } from "@/features/auth/use-admin-session";

const AdminRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAdminSession();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">Checking admin access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default AdminRoute;

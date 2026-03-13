import { useContext } from "react";

import { AdminSessionContext } from "@/features/auth/admin-session-context";

export const useAdminSession = () => {
  const value = useContext(AdminSessionContext);

  if (!value) {
    throw new Error("useAdminSession must be used within AdminSessionProvider.");
  }

  return value;
};

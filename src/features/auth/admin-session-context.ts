import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface AdminSessionContextValue {
  isLoading: boolean;
  isLocalMode: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  user: User | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

import { useEffect, useState, type ReactNode } from "react";

import {
  AdminSessionContext,
  type AdminSessionContextValue,
} from "@/features/auth/admin-session-context";
import { getSupabaseBrowserClient } from "@/integrations/supabase/client";

export const AdminSessionProvider = ({ children }: { children: ReactNode }) => {
  const supabase = getSupabaseBrowserClient();
  const isLocalMode = !supabase;
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(!isLocalMode);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session ?? null);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value: AdminSessionContextValue = {
    isLoading,
    isLocalMode,
    isAuthenticated: isLocalMode || Boolean(session),
    session,
    user: session?.user ?? null,
    signInWithPassword: async (email, password) => {
      if (!supabase) {
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    },
    signOut: async () => {
      if (!supabase) {
        return;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    },
  };

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
};

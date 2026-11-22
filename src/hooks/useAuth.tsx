import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAdminAccess } from "@/lib/adminAccess";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roleLoading: boolean;
  isAdmin: boolean;
  isArticleEditor: boolean;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue>({
  user: null, session: null, loading: true, roleLoading: true,
  isAdmin: false, isArticleEditor: false, signOut: async () => {},
});
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [access, setAccess] = useState(getAdminAccess([]));
  useEffect(() => {
    let alive = true;
    let revision = 0;
    let receivedAuthEvent = false;
    const applySession = (next: Session | null) => {
      const request = ++revision;
      setSession(next);
      setLoading(false);
      setAccess(getAdminAccess([]));
      setRoleLoading(!!next?.user);
      if (!next?.user) return;
      // Schedule outside the auth callback to avoid awaiting another auth operation.
      queueMicrotask(async () => {
        try {
          const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", next.user.id);
          if (alive && request === revision) setAccess(getAdminAccess(error ? [] : (data ?? []).map(row => row.role)));
        } catch {
          if (alive && request === revision) setAccess(getAdminAccess([]));
        } finally {
          if (alive && request === revision) setRoleLoading(false);
        }
      });
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      receivedAuthEvent = true;
      if (alive) applySession(next);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (alive && !receivedAuthEvent) applySession(data.session);
    }).catch(() => { if (alive && !receivedAuthEvent) applySession(null); });
    return () => { alive = false; revision++; subscription.unsubscribe(); };
  }, []);
  const signOut = async () => { await supabase.auth.signOut(); };
  return <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, roleLoading, ...access, signOut }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);

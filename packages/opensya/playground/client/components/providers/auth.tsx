import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useApi } from "@/lib/api";

export interface Session {
  user: User;
  organisation: Organisation;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  organisation: Organisation | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  load: () => Promise<void>;
  reload: () => Promise<void>;
  clear: () => void;

  logout(): Promise<void>;
  isLogouting: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const api = useApi();

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogouting, setLogouting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentSession = await api<Session>("/api/auth");
      setSession(currentSession);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const reload = useCallback(async () => {
    try {
      const currentSession = await api<Session>("/api/auth");
      setSession(currentSession);
    } catch {
      setSession(null);
    }
  }, [api]);

  const clear = useCallback(() => {
    setSession(null);
  }, []);

  const logout = useCallback(async () => {
    setLogouting(true);

    try {
      await api("/api/auth/logout", {
        method: "post",
      });

      clear();
    } finally {
      setLogouting(false);
    }
  }, [api, clear]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,

      user: session?.user ?? null,
      organisation: session?.organisation ?? null,

      isAuthenticated: Boolean(session?.user),
      isLoading,

      load,
      reload,
      clear,

      logout,
      isLogouting,
    };
  }, [session, isLoading, load, reload, clear, logout, isLogouting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useSession must be used inside AuthProvider");
  }

  return context;
}

export const useAuth = useSession;

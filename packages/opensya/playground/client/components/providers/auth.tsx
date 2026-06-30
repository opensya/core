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
import type { UserAuthorization } from "@/lib/auth/types";

export type AuthMeta = UserAuthorization;

export interface Session extends AuthMeta {
  user: User;
  organisation: Organisation;
}

interface AuthContextValue {
  user: User | null;
  setUser: (user: User) => void;

  organisation: Organisation | null;
  setOrganisation: (organisation: Organisation) => void;

  meta: AuthMeta | null;

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

  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [meta, setMeta] = useState<AuthMeta | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLogouting, setLogouting] = useState(false);

  const clear = useCallback(() => {
    setUser(null);
    setOrganisation(null);
    setMeta(null);
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentSession = await api<Session>("/api/auth");

      setUser(currentSession.user);
      setOrganisation(currentSession.organisation);
    } catch {
      clear();
    } finally {
      setIsLoading(false);
    }
  }, [api, clear]);

  const reload = useCallback(async () => {
    try {
      const currentSession = await api<Session>("/api/auth");

      setUser(currentSession.user);
      setOrganisation(currentSession.organisation);
      setMeta(currentSession);
    } catch {
      clear();
    }
  }, [api, clear]);

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
      user,
      setUser,

      organisation,
      setOrganisation,

      meta,

      isAuthenticated: Boolean(user),
      isLoading,

      load,
      reload,
      clear,

      logout,
      isLogouting,
    };
  }, [
    user,
    organisation,
    meta,
    isLoading,
    load,
    reload,
    clear,
    logout,
    isLogouting,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

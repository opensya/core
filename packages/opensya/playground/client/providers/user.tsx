import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { $api } from "@/lib/api";
import { useAuth } from "./02.session.global";

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  isAuth: boolean;
  reload: () => Promise<void>;
  update: (data: Partial<User>) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProvider({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const auth = useAuth();
  const isAuth = auth.user?.id === id;

  const reload = useCallback(async () => {
    try {
      setUser(await $api<User>(`/api/user/${id}`));
    } catch {
      setUser(null);
    }
  }, [id]);

  const update = useCallback(
    async (data: Partial<User>) => {
      try {
        setUser(
          await $api<User>(`/api/user/${id}`, { method: "post", body: data }),
        );

        if (!isAuth) await auth.reload();
      } catch {
        setUser(null);
      }
    },
    [id, isAuth, auth],
  );

  useEffect(() => {
    (async () => {})().then(() => {
      reload().finally(() => setIsLoading(false));
    });
  }, [reload]);

  const value = useMemo<UserContextValue>(
    () => ({ user, isLoading, isAuth, reload, update }),
    [user, isLoading, isAuth, reload, update],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
}

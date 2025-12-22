import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { clearAuth, getToken } from "../storage/auth";

type AuthState = {
  loading: boolean;
  isAuthed: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider(props: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  async function refresh() {
    const token = await getToken();
    setIsAuthed(!!token);
  }

  async function signOut() {
    await clearAuth();
    await refresh();
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  const value = useMemo<AuthState>(
    () => ({ loading, isAuthed, refresh, signOut }),
    [loading, isAuthed]
  );

  return <Ctx.Provider value={value}>{props.children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

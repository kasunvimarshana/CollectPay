import { create } from "zustand";
import type { UserRecord } from "@/domain/User";
import { signIn, signOut, currentUser } from "@/services/auth";

type AuthState = {
  token?: string | null;
  user?: UserRecord | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  async login(email, password) {
    const res = await signIn(email, password);
    set({ token: res.token, user: res.user });
  },
  async logout() {
    await signOut();
    set({ token: null, user: null });
  },
  async refresh() {
    const me = await currentUser();
    set({ user: me });
  },
}));

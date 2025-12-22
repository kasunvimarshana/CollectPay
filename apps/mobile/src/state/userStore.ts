import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { NewUser, UpdateUser, UserRecord } from "@/domain/User";
import { userRepo } from "@/services/repository";
import { syncOnce } from "@/services/sync";

type UserState = {
  users: UserRecord[];
  loadUsers: (forceRemote?: boolean) => Promise<void>;
  getById: (id: string) => UserRecord | undefined;
  createUser: (payload: NewUser) => Promise<void>;
  updateUser: (payload: UpdateUser) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  async loadUsers(forceRemote = false) {
    const rows = await userRepo.list();
    set({ users: rows });
    if (forceRemote)
      await syncOnce().then(async () => set({ users: await userRepo.list() }));
  },
  getById(id) {
    return get().users.find((u) => u.id === id);
  },
  async createUser(payload) {
    await userRepo.createLocal({ ...payload, id: uuidv4() });
    await syncOnce();
    set({ users: await userRepo.list() });
  },
  async updateUser(payload) {
    await userRepo.updateLocal(payload);
    await syncOnce();
    set({ users: await userRepo.list() });
  },
  async deleteUser(id) {
    await userRepo.deleteLocal(id);
    await syncOnce();
    set({ users: await userRepo.list() });
  },
}));

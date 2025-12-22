import {create} from 'zustand';
import {User} from '../domain/entities/User';

type State = {
  users: User[];
};

type Actions = {
  setUsers: (list: User[]) => void;
  upsert: (u: User) => void;
  remove: (id: string) => void;
};

export const useUsersStore = create<State & Actions>(set => ({
  users: [],
  setUsers: list =>
    set({users: list.slice().sort((a, b) => b.updatedAt - a.updatedAt)}),
  upsert: u =>
    set(s => {
      const ix = s.users.findIndex(x => x.id === u.id);
      if (ix >= 0) {
        const next = s.users.slice();
        next[ix] = u;
        return {users: next};
      }
      return {users: [u, ...s.users]};
    }),
  remove: id => set(s => ({users: s.users.filter(u => u.id !== id)})),
}));

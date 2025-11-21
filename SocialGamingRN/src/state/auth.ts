import { create } from 'zustand';
import { getItem, setItem, removeItem, KEYS } from '../lib/storage';

export type User = {
  id: string;
  name?: string;
  email?: string;
};

type AuthState = {
  token?: string;
  user?: User;
  initializing: boolean;
  hydrate: () => void;
  login: (token: string, user?: User) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: undefined,
  user: undefined,
  initializing: true,
  hydrate: () => {
    const t = getItem(KEYS.token);
    set({ token: t, initializing: false });
  },
  login: (token, user) => {
    setItem(KEYS.token, token);
    set({ token, user });
  },
  logout: () => {
    removeItem(KEYS.token);
    set({ token: undefined, user: undefined });
  },
}));
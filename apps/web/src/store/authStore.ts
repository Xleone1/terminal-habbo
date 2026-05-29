import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  created_at?: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
      isAdmin: () => {
        return get().user?.role === 'admin';
      },
    }),
    {
      name: 'auth-store',
    }
  )
);

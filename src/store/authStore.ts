import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  role: string | null;
  setAuth: (token: string, role: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: null,
  setAuth: (token, role) => set({ accessToken: token, role }),
  clearAuth: () => set({ accessToken: null, role: null }),
}));

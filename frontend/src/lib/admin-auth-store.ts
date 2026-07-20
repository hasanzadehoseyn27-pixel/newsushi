import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminAuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: "newsushi-admin-auth" }
  )
);

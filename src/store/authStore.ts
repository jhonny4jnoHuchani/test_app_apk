import AsyncStorage from '@react-native-async-storage/async-storage';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { logout as logoutApi } from '../api/auth.api';

// ============================================================
// TIPOS
// ============================================================
export interface Usuario {
  id: string;
  email: string;
  rol: 'estudiante' | 'docente';
  nombre?: string;
  universidad?: string | null;
  carrera?: string | null;
  semestre?: string | null;
}

interface AuthState {
  usuario: Usuario | null;
  accessToken: string | null;
  refreshToken: string | null;

  login: (data: {
    usuario: Usuario;
    accessToken: string;
    refreshToken: string;
  }) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}









// ============================================================
// STORE
// ============================================================
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      accessToken: null,
      refreshToken: null,

      login: (data) =>
        set({
          usuario: data.usuario,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),

      updateTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      logout: () => {
        // Avisar al backend para revocar el refresh token
        const refreshToken = get().refreshToken;
        if (refreshToken) {
          logoutApi(refreshToken).catch(() => {
            // Si falla, ignorar y cerrar sesión local
          });
        }

        // Cerrar sesión local
        set({
          usuario: null,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: 'tesis-quest-auth',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

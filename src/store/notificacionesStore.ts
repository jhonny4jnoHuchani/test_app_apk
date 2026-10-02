import { create } from 'zustand';
import { Notificacion } from '../api/notificaciones.api';

interface NotificacionesState {
  noLeidas: number;
  notificaciones: Notificacion[];
  setNoLeidas: (n: number) => void;
  setNotificaciones: (n: Notificacion[]) => void;
  marcarLeidaLocal: (id: string) => void;
  limpiar: () => void;
}

export const useNotificacionesStore = create<NotificacionesState>((set) => ({
  noLeidas: 0,
  notificaciones: [],

  setNoLeidas: (n) => set({ noLeidas: n }),
  setNotificaciones: (notificaciones) => set({ notificaciones }),

  marcarLeidaLocal: (id) =>
    set((state) => ({
      notificaciones: state.notificaciones.map((n) =>
        n.id === id ? { ...n, leida: true } : n,
      ),
      noLeidas: Math.max(0, state.noLeidas - 1),
    })),

  limpiar: () => set({ noLeidas: 0, notificaciones: [] }),
}));
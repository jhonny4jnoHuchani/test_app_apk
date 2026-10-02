import { create } from 'zustand';
import { Modalidad, Nivel } from '../api/juego.api';

interface JuegoState {
  modalidadActual: Modalidad | null;
  niveles: Nivel[];
  temaInvestigacion: string | null;
  xpTotal: number;
  puntosInvestigacionTotal: number;
  porcentaje: number;

  setModalidad: (modalidad: Modalidad) => void;
  setMapa: (data: {
    niveles: Nivel[];
    xpTotal: number;
    puntosInvestigacionTotal: number;
    porcentaje: number;
    temaInvestigacion: string | null;
  }) => void;
  limpiar: () => void;
}

export const useJuegoStore = create<JuegoState>((set) => ({
  modalidadActual: null,
  niveles: [],
  temaInvestigacion: null,
  xpTotal: 0,
  puntosInvestigacionTotal: 0,
  porcentaje: 0,

  setModalidad: (modalidad) => set({ modalidadActual: modalidad }),

  setMapa: (data) =>
    set({
      niveles: data.niveles,
      xpTotal: data.xpTotal,
      puntosInvestigacionTotal: data.puntosInvestigacionTotal,
      porcentaje: data.porcentaje,
      temaInvestigacion: data.temaInvestigacion,
    }),

  limpiar: () =>
    set({
      modalidadActual: null,
      niveles: [],
      temaInvestigacion: null,
      xpTotal: 0,
      puntosInvestigacionTotal: 0,
      porcentaje: 0,
    }),
}));
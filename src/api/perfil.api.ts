import { api } from './client';

export interface PerfilResponse {
  id: string;
  nombre: string;
  email: string;
  rol: 'estudiante' | 'docente';
  universidad: string | null;
  carrera: string | null;
  semestre: string | null;
  xpTotal: number;
  puntosInvestigacionTotal: number;
  porcentaje: number;
  insigniasObtenidas: number;
  insigniasTotal: number;
}

export async function obtenerPerfil(): Promise<PerfilResponse> {
  const { data } = await api.get<PerfilResponse>('/auth/me');
  return data;
}
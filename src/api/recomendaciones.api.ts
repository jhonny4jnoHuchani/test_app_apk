import { api } from './client';

export interface Recomendacion {
  id: string;
  nota: string | null;
  completada: boolean;
  createdAt: string;
  misionId: string;
  misionTitulo?: string;
  misionEnunciado?: string;
  tipoInteraccion?: string;
  competencia?: string | null;
  xpRecompensa?: number;
  puntosInvestigacion?: number;
  docenteNombre?: string;
}

// DOCENTE
export async function crearRecomendacion(dto: {
  estudianteId: string;
  misionId: string;
  nota?: string;
}): Promise<Recomendacion> {
  const { data } = await api.post('/recomendaciones', dto);
  return data;
}

export async function listarMisAsignaciones(): Promise<Recomendacion[]> {
  const { data } = await api.get('/recomendaciones/mis-asignaciones');
  return data;
}

export async function eliminarRecomendacion(id: string): Promise<void> {
  await api.delete(`/recomendaciones/${id}`);
}

// ESTUDIANTE
export async function listarMisRecomendaciones(): Promise<Recomendacion[]> {
  const { data } = await api.get('/recomendaciones/mis-recomendaciones');
  return data;
}
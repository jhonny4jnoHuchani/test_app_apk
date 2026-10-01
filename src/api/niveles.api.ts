import { api } from './client';

export interface Mision {
  id: string;
  titulo: string;
  enunciado: string;
  tipoInteraccion: string;
  competencia: string | null;
  esPrincipal: boolean;
  vidasIniciales: number;
  xpRecompensa: number;
  puntosInvestigacion: number;
  contenidoJson: any;
}

export async function listarMisionesDeNivel(nivelId: string): Promise<{
  nivel: any;
  misiones: Mision[];
}> {
  const { data } = await api.get(`/niveles/${nivelId}/misiones`);
  return data;
}

export async function obtenerMision(misionId: string): Promise<Mision> {
  const { data } = await api.get(`/misiones/${misionId}`);
  return data;
}
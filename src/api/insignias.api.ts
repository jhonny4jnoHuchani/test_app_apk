import { api } from './client';

// ============================================================
// TIPOS
// ============================================================
export interface Insignia {
  id: number;
  nombre: string;
  descripcion: string;
  iconoUrl: string | null;
  obtenida: boolean;
  obtenidaEn: string | null;
}

export interface MisInsigniasResponse {
  insignias: Insignia[];
  total: number;
  obtenidas: number;
  pendientes: number;
}

// ============================================================
// LLAMADAS
// ============================================================
export async function obtenerInsigniasDisponibles(): Promise<MisInsigniasResponse> {
  const { data } = await api.get<MisInsigniasResponse>(
    '/juego/insignias-disponibles',
  );
  return data;
}
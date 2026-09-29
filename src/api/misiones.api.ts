import { api } from './client';

// ============================================================
// TIPOS
// ============================================================
export interface EstadoMision {
  misionId: string;
  titulo: string;
  teoria: string | null;
  tipoInteraccion: string;
  competencia: string | null;
  vidasIniciales: number;
  vidasRestantes: number;
  completada: boolean;
  puedeResponder: boolean;
  xpRecompensa: number;
  puntosInvestigacion: number;
}

export interface Criterio {
  nombre: string;
  cumplido: boolean;
  comentario: string;
}

export interface Evaluacion {
  criterios: Criterio[];
  pista: string | null;
  explicacion: string;
}

export interface ProgresoActualizado {
  xpTotal: number;
  puntosInvestigacionTotal: number;
  porcentaje: number;
  nivelActualId: string;
}

export interface InsigniaNueva {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface RespuestaMision {
  intento: {
    id: string;
    resultado: 'correcto' | 'parcial' | 'incorrecto';
    puntuacion: number;
    vidasRestantes: number;
    createdAt: string;
  };
  evaluacion: Evaluacion;
  progreso: ProgresoActualizado | null;
  insigniasNuevas: InsigniaNueva[];
  vidasRestantesHoy: number;
}

// ============================================================
// LLAMADAS A LA API
// ============================================================

export async function obtenerEstadoMision(
  misionId: string,
): Promise<EstadoMision> {
  const { data } = await api.get<EstadoMision>(
    `/juego/misiones/${misionId}/estado`,
  );
  return data;
}

export async function responderMision(
  misionId: string,
  respuesta: string,
  origen: 'nivel' | 'recomendacion_docente' = 'nivel',
): Promise<RespuestaMision> {
  const { data } = await api.post<RespuestaMision>(
    `/juego/misiones/${misionId}/responder`,
    { respuesta, origen },
    { timeout: 40000 }, // 40s para la IA
  );
  return data;
}

export async function obtenerTextoGenerado(misionId: string): Promise<{
  misionId: string;
  titulo: string;
  instruccion: string;
  texto: string;
  erroresEsperados: any[];
}> {
  const { data } = await api.get(`/juego/misiones/${misionId}/texto`, {
    timeout: 40000,
  });
  return data;
}
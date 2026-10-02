import { api } from './client';

// ============================================================
// TIPOS
// ============================================================
export interface Modalidad {
  id: number;
  nombre: string;
  descripcion: string;
  ordenMundo: number;
}

export interface Mision {
  id: string;
  titulo: string;
  teoria: string | null;
  tipoInteraccion: string;
  contenidoJson: any;
  competencia: string | null;
  esPrincipal: boolean;
  vidasIniciales: number;
  xpRecompensa: number;
  puntosInvestigacion: number;
  completada: boolean;
  vidasRestantes: number;
  bloqueada: boolean;
}

export interface Nivel {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  orden: number;
  tipo: 'estandar' | 'boss';
  completado: boolean;
  bloqueado: boolean;
  misiones: Mision[];
}

export interface MapaResponse {
  progreso: {
    xpTotal: number;
    puntosInvestigacionTotal: number;
    porcentaje: number;
    nivelActualId: string | null;
  };
  niveles: Nivel[];
}

export interface MiProgreso {
  xpTotal: number;
  puntosInvestigacionTotal: number;
  porcentaje: number;
  nivelActualId: string | null;
  temaInvestigacion: string | null;
  totalNiveles: number;
}

export interface CompatibilidadTema {
  conCarrera: boolean;
  conModalidad: boolean;
  comentario: string;
}

export interface ModalidadSugerida {
  id: number;
  nombre: string;
}

export interface ValidacionTemaExitosa {
  valido: boolean;
  elementos?: Record<string, boolean>;
  razon?: string;
  compatibilidad?: CompatibilidadTema;
  advertenciaCarrera: string | null;
  sugerenciaCarrera: string | null;
}

export interface TemaGuardadoResponse {
  mensaje: string;
  modalidadId: number;
  temaInvestigacion: string;
  validacion: ValidacionTemaExitosa;
}

export interface TemaInvalidoResponse {
  statusCode?: number;
  message?: string;
  razon?: string;
  explicacion?: string;
  sugerencia?: string | null;
  elementosFaltantes?: string[];
  elementosPresentes?: string[];
  compatibilidad?: CompatibilidadTema;
  modalidadSugerida?: ModalidadSugerida | null;
}

// ============================================================
// LLAMADAS A LA API
// ============================================================

export async function listarModalidades(): Promise<Modalidad[]> {
  const { data } = await api.get<Modalidad[]>('/modalidades');
  return data;
}

export async function obtenerMapa(modalidadId: number): Promise<MapaResponse> {
  const { data } = await api.get<MapaResponse>(
    `/juego/modalidades/${modalidadId}/mapa`,
  );
  return data;
}

export async function obtenerMiProgreso(
  modalidadId: number,
): Promise<MiProgreso> {
  const { data } = await api.get<MiProgreso>(
    `/juego/modalidades/${modalidadId}/mi-progreso`,
  );
  return data;
}

export async function establecerTema(
  modalidadId: number,
  temaInvestigacion: string,
): Promise<TemaGuardadoResponse> {
  const { data } = await api.post<TemaGuardadoResponse>(
    `/juego/modalidades/${modalidadId}/iniciar`,
    { temaInvestigacion },
  );
  return data;
}

// ============================================================
// MIS MODALIDADES (lobby)
// ============================================================
export type EstadoModalidad =
  | 'no_iniciada'
  | 'sin_tema'
  | 'en_progreso'
  | 'completada';

export interface ModalidadDelEstudiante {
  modalidadId: number;
  nombre: string;
  descripcion: string;
  ordenMundo: number;
  estado: EstadoModalidad;
  temaInvestigacion: string | null;
  xpTotal: number;
  puntosInvestigacionTotal: number;
  porcentaje: number;
  nivelActualId: string | null;
  totalNiveles: number;
  nivelesCompletados: number;
}

export async function obtenerMisModalidades(): Promise<{
  modalidades: ModalidadDelEstudiante[];
}> {
  const { data } = await api.get('/juego/mis-modalidades');
  return data;
}
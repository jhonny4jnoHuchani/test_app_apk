import { api } from './client';

export interface ProgresoGrupo {
  grupo: {
    id: string;
    nombre: string;
    codigoAcceso: string;
    fechaExpiracion: string | null;
    activo: boolean;
  };
  estudiantes: Array<{
    id: string;
    nombre: string;
    email: string;
    universidad: string | null;
    carrera: string | null;
    semestre: string | null;
    joinedAt: string;
    xpTotal: number;
    puntosInvestigacionTotal: number;
    porcentajeMax: number;
    modalidadesActivas: number;
  }>;
  totalEstudiantes: number;
}

export interface RankingEstudiante {
  id: string;
  nombre: string;
  email: string;
  xpTotal: string;
  puntosInvestigacionTotal: string;
  porcentajeMax: string;
}

export interface MisionFallada {
  misionId: string;
  titulo: string;
  competencia: string | null;
  totalIntentos: string;
  incorrectos: string;
  parciales: string;
  correctos: string;
}

export interface ResumenGrupo {
  grupo: {
    id: string;
    nombre: string;
    codigoAcceso: string;
    activo: boolean;
  };
  totalEstudiantes: number;
  xpPromedio: number;
  porcentajePromedio: number;
  estudiantesActivosUltimos7Dias: number;
  competenciasDebiles: Array<{ competencia: string; fallos: string }>;
}

export async function obtenerProgresoGrupo(grupoId: string): Promise<ProgresoGrupo> {
  const { data } = await api.get(`/reportes/grupos/${grupoId}/progreso`);
  return data;
}

export async function obtenerRankingGrupo(grupoId: string): Promise<{
  grupoId: string;
  grupoNombre: string;
  ranking: RankingEstudiante[];
  total: number;
}> {
  const { data } = await api.get(`/reportes/grupos/${grupoId}/ranking`);
  return data;
}

export async function obtenerMisionesFalladas(grupoId: string): Promise<{
  grupoId: string;
  grupoNombre: string;
  misiones: MisionFallada[];
  total: number;
}> {
  const { data } = await api.get(`/reportes/grupos/${grupoId}/misiones-falladas`);
  return data;
}

export async function obtenerResumenGrupo(grupoId: string): Promise<ResumenGrupo> {
  const { data } = await api.get(`/reportes/grupos/${grupoId}/resumen`);
  return data;
}
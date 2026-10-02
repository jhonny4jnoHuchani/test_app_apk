import { api } from './client';

export interface Grupo {
  id: string;
  docenteId: string;
  nombre: string;
  codigoAcceso: string;
  fechaExpiracion: string | null;
  activo: boolean;
  createdAt: string;
  cantidadEstudiantes?: number;
}

export interface EstudianteEnGrupo {
  id: string;
  nombre: string;
  email: string;
  universidad: string | null;
  carrera: string | null;
  semestre: string | null;
  joinedAt: string;
}

export interface GrupoDetalle {
  grupo: Grupo;
  estudiantes: EstudianteEnGrupo[];
}

// DOCENTE
export async function crearGrupo(dto: {
  nombre: string;
  fechaExpiracion?: string;
}): Promise<Grupo> {
  const { data } = await api.post('/grupos', dto);
  return data;
}

export async function listarMisGruposDocente(): Promise<Grupo[]> {
  const { data } = await api.get('/grupos/mis-grupos');
  return data;
}

export async function obtenerDetalleGrupo(grupoId: string): Promise<GrupoDetalle> {
  const { data } = await api.get(`/grupos/${grupoId}`);
  return data;
}

export async function desactivarGrupo(grupoId: string): Promise<Grupo> {
  const { data } = await api.patch(`/grupos/${grupoId}/desactivar`);
  return data;
}

export async function eliminarGrupo(grupoId: string): Promise<void> {
  await api.delete(`/grupos/${grupoId}`);
}

// ESTUDIANTE
export async function unirseAGrupo(codigo: string): Promise<any> {
  const { data } = await api.post('/grupos/unirse', { codigo });
  return data;
}

export async function listarMisGruposEstudiante(): Promise<any[]> {
  const { data } = await api.get('/grupos/mis-grupos-como-estudiante');
  return data;
}

export async function salirDelGrupo(grupoId: string): Promise<void> {
  await api.delete(`/grupos/salir/${grupoId}`);
}
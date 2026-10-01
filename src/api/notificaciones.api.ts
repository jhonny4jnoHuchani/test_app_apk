import { api } from './client';

export interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  referenciaId: string | null;
  leida: boolean;
  createdAt: string;
}

export async function obtenerMisNotificaciones(): Promise<{
  notificaciones: Notificacion[];
  total: number;
}> {
  const { data } = await api.get('/notificaciones/mis-notificaciones');
  return data;
}

export async function obtenerContadorNoLeidas(): Promise<{ noLeidas: number }> {
  const { data } = await api.get('/notificaciones/contador-no-leidas');
  return data;
}

export async function marcarComoLeida(id: string): Promise<void> {
  await api.patch(`/notificaciones/${id}/leer`);
}

export async function marcarTodasComoLeidas(): Promise<void> {
  await api.patch('/notificaciones/leer-todas');
}
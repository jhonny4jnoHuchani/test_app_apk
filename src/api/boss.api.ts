import { api } from './client';

export interface SesionBoss {
  id: string;
  nivelId: string;
  iniciadoEn: string;
  duracionSegundos: number;
  finalizado: boolean;
  resultadoFinal: 'superado' | 'no_superado' | null;
  tiempoRestanteSegundos: number;
}

export async function iniciarBoss(nivelId: string): Promise<SesionBoss> {
  const { data } = await api.post(`/boss/niveles/${nivelId}/iniciar`);
  return data;
}

export async function consultarSesionBoss(sesionId: string): Promise<SesionBoss> {
  const { data } = await api.get(`/boss/sesiones/${sesionId}`);
  return data;
}

export async function responderBoss(
  sesionId: string,
  misionId: string,
  respuesta: string,
): Promise<any> {
  const { data } = await api.post(
    `/boss/sesiones/${sesionId}/responder`,
    { misionId, respuesta },
    { timeout: 40000 },
  );
  return data;
}

export async function obtenerSesionActivaBoss(
  nivelId: string,
): Promise<SesionBoss | null> {
  const { data } = await api.get<SesionBoss | null>(
    `/boss/niveles/${nivelId}/sesion-activa`,
  );
  return data;
}
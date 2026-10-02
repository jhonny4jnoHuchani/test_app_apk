import { api } from './client';

// ============================================================
// TIPOS
// ============================================================
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nombre: string;
  email: string;
  password: string;
  rol: 'estudiante' | 'docente';
  universidad?: string;
  carrera?: string;
  semestre?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: 'estudiante' | 'docente';
    universidad?: string | null;
    carrera?: string | null;
    semestre?: string | null;
  };
}

// ============================================================
// LLAMADAS A LA API
// ============================================================

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', dto);
  return data;
}

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', dto);
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch {
    // Ignorar errores: si falla, igual cerramos sesión local
  }
}

export async function getMe(): Promise<{
  id: string;
  email: string;
  rol: 'estudiante' | 'docente';
}> {
  const { data } = await api.get('/auth/me');
  return data;
}
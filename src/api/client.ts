import axios from "axios";
import { useAuthStore } from "../store/authStore";

// ⚠️ IMPORTANTE: Cambia esta IP por la tuya (192.168.100.70)
// Cuando pruebes en otro WiFi, actualízala.
export const BASE_URL = "http://192.168.100.14:3000/api";
// export const BASE_URL = "http://172.20.0.53:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 segundos por defecto
  headers: {
    "Content-Type": "application/json",
  },
});
 

// ============================================================
// INTERCEPTOR DE REQUEST: Añade el access_token automáticamente
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================
// INTERCEPTOR DE RESPONSE: Renueva el token cuando expira (401)
// ============================================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si no es un 401, no hacemos nada
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, encolamos esta petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        throw new Error("No hay refresh token disponible");
      }

      // Llamada directa con axios (no con api) para evitar bucle infinito
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      // Actualizar el store con los nuevos tokens
      useAuthStore.getState().updateTokens(newAccessToken, newRefreshToken);

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // El refresh también falló → cerrar sesión
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

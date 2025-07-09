import axios, { AxiosResponse } from "axios";
import { STATUS } from "@/constants/status";
import { logoutUser } from "@/utils/authHelpers";

export const api = axios.create({
  baseURL: window.__APP_CONFIG__!.BASE_URL + "/api",
  withCredentials: true,
  timeout: 1500000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de solicitud: adjunta el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accesToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const originalRequest = error.config;

    // TIMEOUT
    if (error.code === "ECONNABORTED") {
      console.warn("⏱ Timeout excedido");
      return Promise.reject(error);
    }

    // NETWORK ERROR sin respuesta
    if (!error.response) {
      console.warn("🌐 Network error sin response");
      return Promise.reject(error);
    }

    // 401 → cerrar sesión
    if (error.response.status === STATUS.UNAUTHORIZED) {
      logoutUser();
      return Promise.reject(error);
    }

    // 403 → posible renovación de token
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      const nuevoToken = error.response?.data?.resultado?.[0]?.accesToken;
      if (nuevoToken) {
        console.info("🔁 Token renovado automáticamente");
        localStorage.setItem("accesToken", nuevoToken);
        originalRequest.headers.Authorization = `Bearer ${nuevoToken}`;
        return api(originalRequest); // 🔁 Reintenta la petición original
      }
    }

    return Promise.reject(error);
  }
);

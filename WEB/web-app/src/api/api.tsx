import { API_ENDPOINTS } from "@/constants/apiEndPoints";
import { STATUS } from "@/constants/status";
import { logoutUser } from "@/utils/authHelpers";
import axios from "axios";

export const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accesToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  r => r,
  err => {
    const cfg: import("axios").AxiosRequestConfig = err.config;
    // si pediste skipAuthHandler, aquí no forzamos logoutUser()
    if (cfg.skipAuthHandler) return Promise.reject(err);

    // solo en el error 401 forzamos logoutUser()
    if ([STATUS.UNAUTHORIZED].includes(err.response?.status)) {
      logoutUser();
    }
    return Promise.reject(err);
  }
);


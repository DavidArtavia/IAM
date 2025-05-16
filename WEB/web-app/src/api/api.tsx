import { API_ENDPOINTS } from "@/constants/apiEndPoints";
import { STATUS } from "@/constants/status";
import { logoutUser } from "@/utils/authHelpers";
import axios from "axios";

const api = axios.create({
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
    console.log("entro al interceptor de solicitud donde mandamos el token");   
    const token = localStorage.getItem('accesToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// handle 401/403 globally, **saltándose** el handler únicamente cuando tú le digas
api.interceptors.response.use(
  r => r,
  err => {
    const cfg: import("axios").AxiosRequestConfig = err.config;
    // si pediste skipAuthHandler, aquí no forzamos logoutUser()
    if (cfg.skipAuthHandler) return Promise.reject(err);

    if ([STATUS.UNAUTHORIZED, STATUS.FORBIDDEN].includes(err.response?.status)) {
      logoutUser();
    }
    return Promise.reject(err);
  }
);


export default api;

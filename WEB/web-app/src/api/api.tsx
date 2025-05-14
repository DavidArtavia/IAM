import { API_ENDPOINTS } from "@/constants/apiEndPoints";
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
    console.log("entro al interceptor de solicitud");
    
    const token = localStorage.getItem('accesToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

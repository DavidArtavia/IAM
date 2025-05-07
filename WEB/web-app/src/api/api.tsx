import { API_ENDPOINTS } from "@/constants/apiEndPoints";
import axios from "axios";

const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  withCredentials: true,
});

export default api;

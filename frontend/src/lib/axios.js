// instance to use throughout application
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? `${import.meta.env.VITE_BACKEND_DEV_URL}/api` : '/api',
  withCredentials: import.meta.env.MODE === "development",
});

export default axiosInstance;
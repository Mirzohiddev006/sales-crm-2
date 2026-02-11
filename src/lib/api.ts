import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const VITE_API_BASE_URL =
  ((import.meta as any).env?.VITE_API_BASE_URL || "https://poems-make-motion-indianapolis.trycloudflare.com/").replace(/\/$/, "");

export const authErrorEvent = new EventTarget();

export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // BU YERDA URL'NI TEKSHIRING: 
        // Agar baseURL oxirida '/' bo'lsa, bu yerda '/auth/refresh' emas, 'auth/refresh' bo'lishi kerak
        const res = await axios.post('https://...trycloudflare.com/auth/refresh', {
          refresh_token: localStorage.getItem('refresh_token')
        });
        // ...
      } catch (refreshError) {
        // Agar refresh ham xato bersa, logout qildirish kerak
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_id");
  authErrorEvent.dispatchEvent(new Event("unauthorized"));
}

export default api;

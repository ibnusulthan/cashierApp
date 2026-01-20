import axios from "axios";
import { getCookie } from "cookies-next";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  // Ambil token hanya jika ada
  const token = getCookie("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      if (typeof window !== "undefined") {
        // Simpan path terakhir biar bisa redirect balik setelah login
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          sessionStorage.setItem("redirectAfterLogin", currentPath);
        }

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

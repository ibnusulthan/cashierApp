import { api } from "./axios";
import { setCookie, deleteCookie } from "cookies-next";
import { LoginResponse } from "@/types/auth";

export const login = async (username: string, password: string) => {
  const res = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });

  const { token, user } = res.data;

  // Simpan token di cookie (1 hari sesuai backend: JWT_EXPIRES_IN="1d")
  setCookie("token", token, {
    path: "/",
    maxAge: 60 * 60 * 24, // 1 hari
    sameSite: "lax",
  });

  return user;
};

export const logout = () => {
  deleteCookie("token", { path: "/" });

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};
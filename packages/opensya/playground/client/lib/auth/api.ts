import { $api } from "@/lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return $api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function logout(): Promise<AuthResponse> {
  return $api<AuthResponse>("/api/auth/logout", {
    method: "POST",
  });
}

export async function refreshToken(): Promise<AuthResponse> {
  return $api<AuthResponse>("/api/auth/refresh-token", { method: "POST" });
}

export interface AuthUser {
  id: string;
  email: string;
}

export async function getCurrentUser(): Promise<AuthUser> {
  return $api<AuthUser>("/api/auth/me");
}

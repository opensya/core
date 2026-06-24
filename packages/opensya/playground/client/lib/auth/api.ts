import { $fetch } from "ofetch";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return $fetch<AuthResponse>("/api/login", {
    method: "POST",
    credentials: "include",
    body: payload,
  });
}

export async function refreshToken(): Promise<AuthResponse> {
  return $fetch<AuthResponse>("/api/refresh-token", {
    method: "POST",
    credentials: "include",
  });
}

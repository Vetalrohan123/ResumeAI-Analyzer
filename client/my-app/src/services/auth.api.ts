import {
  apiPost,
} from "@/lib/api/client";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: AuthUser;
  };
}

/* ============================================================
   LOGIN
============================================================ */

export async function login(
  input: LoginInput
): Promise<LoginResponse> {
  return apiPost<LoginResponse>(
    "/auth/login",
    input
  );
}

/* ============================================================
   LOGOUT
============================================================ */

export async function logout(): Promise<void> {
  await apiPost(
    "/auth/logout"
  );
}
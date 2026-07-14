import { api } from "../api/api";
import { LoginRequest, SignupRequest } from "../types/auth.types";

export async function login(data: LoginRequest) {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export async function signup(data: SignupRequest) {
  const response = await api.post("/auth/signup", data);
  return response.data;
}

export function logout() {
  localStorage.removeItem("token");
}

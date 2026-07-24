import { api } from "../api/api";
import type {
  Addon,
  CreateAddonsRequest,
  UpdateAddonsRequest,
} from "../types/addons/addons.types";

export async function getAlladdons(): Promise<Addon[]> {
  const response = await api.get<Addon[]>("/addons");
  return response.data;
}

export async function getAddon(id: string): Promise<Addon> {
  const response = await api.get<Addon>(`/addons/${id}`);
  return response.data;
}

export async function createAddon(
  data: CreateAddonsRequest,
): Promise<{ message: string; addon: Addon }> {
  const response = await api.post<{ message: string; addon: Addon }>(
    "/addons",
    data,
  );
  return response.data;
}

export async function updateAddon(
  id: string,
  data: UpdateAddonsRequest,
): Promise<{ message: string; addon: Addon }> {
  const response = await api.patch<{ message: string; addon: Addon }>(
    `/addons/${id}`,
    data,
  );
  return response.data;
}

export async function deleteAddon(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/addons/${id}`);
  return response.data;
}

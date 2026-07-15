import { api } from "../api/api";
import type {
  App,
  CreateAppRequest,
  CreateAppResponse,
  UpdateAppRequest,
} from "../types/app.types";

export async function createApp(
  data: CreateAppRequest,
): Promise<CreateAppResponse> {
  const response = await api.post<CreateAppResponse>("/apps", data);
  return response.data;
}

export async function getApps(): Promise<App[]> {
  const response = await api.get<App[]>("/apps");
  return response.data;
}

export async function getApp(id: string): Promise<App> {
  const response = await api.get<App>(`/apps/${id}`);
  return response.data;
}

export async function updateApp(
  id: string,
  data: UpdateAppRequest,
): Promise<CreateAppResponse> {
  const response = await api.patch<CreateAppResponse>(`/apps/${id}`, data);

  return response.data;
}

export async function deleteApp(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/apps/${id}`);

  return response.data;
}

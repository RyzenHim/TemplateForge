import { api } from "../api/api";
import type {
  CreateTemplateRequest,
  Template,
  TemplateResponse,
  UpdateTemplateRequest,
} from "../types/template.types";

export async function createTemplate(
  data: CreateTemplateRequest,
): Promise<TemplateResponse> {
  const response = await api.post<TemplateResponse>("/templates", data);
  return response.data;
}

export async function getMyTemplates(): Promise<Template[]> {
  const response = await api.get<Template[]>("/templates/my");
  return response.data;
}

export async function getPublicTemplates(): Promise<Template[]> {
  const response = await api.get<Template[]>("/templates/public");
  return response.data;
}

export async function getTemplate(id: string): Promise<Template> {
  const response = await api.get<Template>(`/templates/${id}`);
  return response.data;
}

export async function updateTemplate(
  id: string,
  data: UpdateTemplateRequest,
): Promise<TemplateResponse> {
  const response = await api.patch<TemplateResponse>(`/templates/${id}`, data);
  return response.data;
}

export async function deleteTemplate(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/templates/${id}`);
  return response.data;
}

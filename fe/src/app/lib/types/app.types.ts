export interface App {
  id: string;
  name: string;
  description: string;
  packageName: string;
  icon: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppRequest {
  name: string;
  description?: string;
  packageName: string;
}

export interface UpdateAppRequest {
  name?: string;
  description?: string;
  packageName?: string;
}

export interface CreateAppResponse {
  message: string;
  app: App;
}

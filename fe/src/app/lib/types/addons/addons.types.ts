export type Platform = "Android" | "iOS" | "Android & iOS";

export interface Addon {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  platform: Platform;
}

export interface CreateAddonsRequest {
  name: string;
  description: string;
  icon?: string;
  category: string;
  platform: Platform | "";
}
export interface AddonsFormProps {
  mode: "create" | "edit";
  addonId?: string;
}

export type UpdateAddonsRequest = Partial<CreateAddonsRequest>;

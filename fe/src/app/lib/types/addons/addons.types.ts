export type Platform = "Android" | "iOS" | "Android & iOS";

export interface Addon {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  platform: Platform;
  pricingType: "free" | "paid";
  price: number;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddonsRequest {
  name: string;
  description: string;
  icon?: string;
  category: string;
  platform: Platform | "";
  pricingType: "free" | "paid";
  // Entered as INR in the editor; converted to paise before sending to the API.
  price: number;
}
export interface AddonsFormProps {
  mode: "create" | "edit";
  addonId?: string;
}

export type UpdateAddonsRequest = Partial<CreateAddonsRequest>;

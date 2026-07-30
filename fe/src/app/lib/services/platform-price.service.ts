import { api } from "../api/api";
import type { PlatformPrice } from "../types/platform-price.types";
export const getPlatformPrices = async () => (await api.get<PlatformPrice[]>("/platform-prices")).data;
export const updatePlatformPrices = async (prices: { platform: string; price: number }[]) => (await api.put<PlatformPrice[]>("/platform-prices", { prices })).data;

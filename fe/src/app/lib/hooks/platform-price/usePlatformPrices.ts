import { useQuery } from "@tanstack/react-query";
import { getPlatformPrices } from "../../services/platform-price.service";
export const usePlatformPrices = () => useQuery({ queryKey: ["platform-prices"], queryFn: getPlatformPrices });

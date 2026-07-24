import { useQuery } from "@tanstack/react-query";
import { getAddon } from "../../services/add_ons.service";

export function useAddon(id?: string) {
  return useQuery({
    queryKey: ["addon", id],
    queryFn: () => getAddon(id!),
    enabled: !!id,
  });
}

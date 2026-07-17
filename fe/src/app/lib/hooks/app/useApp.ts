import { useQuery } from "@tanstack/react-query";
import { getApp } from "../../services/app.service";

export function useApp(id: string) {
  return useQuery({
    queryKey: ["app", id],
    queryFn: () => getApp(id),
    enabled: !!id,
  });
}

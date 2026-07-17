import { useQuery } from "@tanstack/react-query";
import { getApps } from "../../services/app.service";

export function useApps() {
  return useQuery({
    queryKey: ["apps"],
    queryFn: getApps,
  });
}

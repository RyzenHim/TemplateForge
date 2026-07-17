import { useQuery } from "@tanstack/react-query";
import { getTemplate } from "../../services/template.service";

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: () => getTemplate(id),
    enabled: !!id,
  });
}

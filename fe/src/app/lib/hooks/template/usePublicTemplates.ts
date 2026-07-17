import { useQuery } from "@tanstack/react-query";
import { getPublicTemplates } from "../../services/template.service";

export function usePublicTemplates() {
  return useQuery({
    queryKey: ["public-templates"],
    queryFn: getPublicTemplates,
  });
}

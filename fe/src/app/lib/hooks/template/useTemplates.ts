import { useQuery } from "@tanstack/react-query";
import { getMyTemplates } from "../../services/template.service";

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: getMyTemplates,
  });
}

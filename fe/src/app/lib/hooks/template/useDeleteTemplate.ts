import { useMutation } from "@tanstack/react-query";
import { deleteTemplate } from "../../services/template.service";

export function useDeleteTemplate() {
  return useMutation({
    mutationFn: deleteTemplate,
  });
}

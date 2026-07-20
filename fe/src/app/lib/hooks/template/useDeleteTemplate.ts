import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTemplate } from "../../services/template.service";

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      // Refresh every template list so the deleted item disappears
      // instantly regardless of which page triggered the delete.
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["public-templates"] });
    },
  });
}

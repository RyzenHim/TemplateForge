import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTemplate } from "../../services/template.service";

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateTemplate>[1];
    }) => updateTemplate(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["public-templates"] });
      queryClient.invalidateQueries({ queryKey: ["template"] });
    },
  });
}

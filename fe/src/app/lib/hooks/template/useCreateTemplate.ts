import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTemplate } from "../../services/template.service";

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplate,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["templates"],
      });
      queryClient.invalidateQueries({
        queryKey: ["public-templates"],
      });
    },
  });
}

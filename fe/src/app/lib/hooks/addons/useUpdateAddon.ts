import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAddon } from "../../services/add_ons.service";

export function useUpdateAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateAddon>[1];
    }) => updateAddon(id, data),

    onSuccess: async (_data, variables) => {
      // Wait for both cache invalidations to complete before navigating
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["addons"] }),
        queryClient.invalidateQueries({ queryKey: ["addon", variables.id] }),
      ]);
    },
  });
}

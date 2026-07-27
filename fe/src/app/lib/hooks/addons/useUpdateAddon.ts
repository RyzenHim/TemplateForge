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

    onSuccess: (_data, variables) => {
      // Invalidate so next mount always refetches fresh data
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      queryClient.invalidateQueries({ queryKey: ["addon", variables.id] });
    },
  });
}

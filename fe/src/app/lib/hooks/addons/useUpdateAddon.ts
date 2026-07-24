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

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      queryClient.invalidateQueries({ queryKey: ["addon"] });
    },
  });
}

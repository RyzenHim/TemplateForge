import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAddon } from "../../services/add_ons.service";

export function useDeleteAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddon,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    },
  });
}

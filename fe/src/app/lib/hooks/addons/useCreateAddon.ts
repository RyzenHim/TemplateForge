import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createAddon } from "../../services/add_ons.service";
import { showApiSuccess, showApiError } from "../../utils";

export function useCreateAddon() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createAddon,

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      showApiSuccess(response.message);
      router.push("/dashboard/addons");
    },

    onError: (error: Error) => {
      showApiError(error);
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createAddon } from "../../services/add_ons.service";

export function useCreateAddon() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createAddon,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      router.push("/dashboard/addons");
    },

    onError: (error: Error) => {
      console.error("Failed to create addon:", error);
    },
  });
}

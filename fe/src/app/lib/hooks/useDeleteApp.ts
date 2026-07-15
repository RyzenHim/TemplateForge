import { useMutation } from "@tanstack/react-query";
import { deleteApp } from "../services/app.service";

export function useDeleteApp() {
  return useMutation({
    mutationFn: deleteApp,
  });
}

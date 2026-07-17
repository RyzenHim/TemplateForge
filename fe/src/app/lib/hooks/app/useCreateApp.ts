import { useMutation } from "@tanstack/react-query";
import { createApp } from "../../services/app.service";

export function useCreateApp() {
  return useMutation({
    mutationFn: createApp,
  });
}

import { useMutation } from "@tanstack/react-query";
import { updateApp } from "../services/app.service";

export function useUpdateApp() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateApp>[1];
    }) => updateApp(id, data),
  });
}

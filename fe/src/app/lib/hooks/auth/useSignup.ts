import { useMutation } from "@tanstack/react-query";
import { signup } from "../../services/auth.service";

export function useSignup() {
  return useMutation({
    mutationFn: signup,
  });
}

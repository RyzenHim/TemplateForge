import { useMutation } from "@tanstack/react-query";
import { createOrder } from "../../services/payment.service";

export function useCreateOrder() {
  return useMutation({
    mutationFn: createOrder,
  });
}

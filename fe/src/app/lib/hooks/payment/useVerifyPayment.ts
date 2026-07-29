import { useMutation } from "@tanstack/react-query";

import { verifyPayment } from "../../services/payment.service";

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: verifyPayment,
  });
};

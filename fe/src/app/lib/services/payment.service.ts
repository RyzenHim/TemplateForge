import { api } from "../api/api";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "../types/payment.types";

export async function createOrder(
  data: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  const response = await api.post<CreateOrderResponse>(
    "/payments/create-order",
    data,
  );
  return response.data;
}

export async function verifyPayment(
  data: VerifyPaymentRequest,
): Promise<VerifyPaymentResponse> {
  const response = await api.post("/payments/verify", data);

  return response.data;
}

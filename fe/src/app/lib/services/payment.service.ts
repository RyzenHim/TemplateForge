import { api } from "../api/api";
import {
  CreateOrderRequest,
  CreateOrderResponse,
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

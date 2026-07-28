export interface CreateOrderRequest {
  planId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
}

export interface CreateOrderRequest {
  appId: string;
}

export interface CreateOrderResponse {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  appName: string;
  description: string;
}

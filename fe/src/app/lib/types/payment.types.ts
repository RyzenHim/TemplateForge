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
  breakdown: {
    baseAmount: number;
    addonAmount: number;
    addonItems: { name: string; price: number }[];
    totalAmount: number;
  };
}
export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}
export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
export interface RazorpayPaymentFailureResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

export type PaymentStatus =
  | "created"
  | "success"
  | "failed"
  | "pending"
  | "cancelled"
  | "refunded";

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  gateway: string;
  status: PaymentStatus;
  gatewayStatus: string | null;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  gatewayReceipt: string | null;
  paymentMethod: string | null;
  failureReason: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  app: {
    id: string;
    name: string;
    platform: string | null;
    packageName: string | null;
    version: string | null;
    status: string | null;
  } | null;
}

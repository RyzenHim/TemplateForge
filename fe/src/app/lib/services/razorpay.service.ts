import {
  CreateOrderResponse,
  RazorpayPaymentFailureResponse,
  RazorpayPaymentSuccessResponse,
} from "../types/payment.types";

interface RazorpayOptions {
  order: CreateOrderResponse;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onFailure?: (response: RazorpayPaymentFailureResponse) => void;
}
export const openRazorpayCheckout = ({
  order,
  onSuccess,
  onFailure,
}: RazorpayOptions) => {
  const razorpay = new window.Razorpay({
    key: order.key,
    amount: order.amount,
    currency: order.currency,
    name: "TemplateForge",
    description: order.appName,
    order_id: order.orderId,
    handler: onSuccess,
    theme: {
      color: "#4F46E5",
    },
  });

  razorpay.on("payment.failed", (response: RazorpayPaymentFailureResponse) => {
    onFailure?.(response);
  });

  razorpay.open();
};

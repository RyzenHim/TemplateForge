import { CreateOrderResponse } from "../types/payment.types";

interface RazorpayOptions {
  order: CreateOrderResponse;
  onSuccess: (response: any) => void;
}

export const openRazorpayCheckout = ({ order, onSuccess }: RazorpayOptions) => {
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

  razorpay.open();
};

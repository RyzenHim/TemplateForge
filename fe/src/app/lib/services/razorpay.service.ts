import type { CreateOrderResponse } from "../types/payment.types";

export function openRazorpayCheckout(order: CreateOrderResponse) {
  const razorpay = new window.Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    order_id: order.orderId,
    amount: order.amount,
    currency: order.currency,
    name: "TemplateForge",
    description: "Application Purchase",
    handler(response: any) {
      console.log("Payment Success", response);
    },
  });

  razorpay.open();
}

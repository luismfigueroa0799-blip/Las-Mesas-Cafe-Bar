import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-10-28.acacia" as any,
});

export const STRIPE_SUCCESS_URL =
  process.env.NEXT_PUBLIC_APP_URL + "/pedido-confirmado";
export const STRIPE_CANCEL_URL = process.env.NEXT_PUBLIC_APP_URL + "/carrito";

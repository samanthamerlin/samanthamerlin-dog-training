import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility
export const stripe = {
  get customers() {
    return getStripe().customers;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

export const getStripeCustomerId = async (email: string, name?: string | null): Promise<string> => {
  const stripeClient = getStripe();

  // Check if customer exists
  const customers = await stripeClient.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  // Create new customer
  const customer = await stripeClient.customers.create({
    email,
    name: name || undefined,
  });

  return customer.id;
};

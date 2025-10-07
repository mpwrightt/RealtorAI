import { stripe } from "../lib/stripe/client";

async function testPayment() {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 10000,
    currency: "usd",
    description: "Test payment intent",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  console.log("Payment Intent created:", paymentIntent.id);
  console.log("Client Secret:", paymentIntent.client_secret);
  console.log("Use Stripe test cards such as 4242 4242 4242 4242 to confirm the payment.");
}

testPayment().catch((error) => {
  console.error("Payment test failed", error);
  process.exit(1);
});

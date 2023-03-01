'use strict';

/**
 * A set of functions called "actions" for `pagamentos`
 */

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET
  const unparsed = require('koa-body/unparsed.js')

module.exports = {
  event: async (ctx) => {

    let event = ctx.request.body[unparsed];
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = ctx.request.header['stripe-signature'];

      try {
        event = await stripe.webhooks.constructEvent(
          ctx.request.body[unparsed],
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        ctx.throw(400, err.message)
      }
    }
    console.log('event.type:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        console.log(`Checkout Session is completed!`);
        // Payment is successful and the subscription is created.
        // You should provision the subscription and save the customer ID to your database.
        break;
      case 'invoice.paid':
        console.log(`Invoice paid`);
        // Continue to provision the subscription as payments continue to be made.
        // Store the status in your database and check when a user accesses your service.
        // This approach helps you avoid hitting rate limits.
        break;
      case 'invoice.payment_failed':
        console.log(`Invoice payment failed!`);
        // The payment failed or the customer does not have a valid payment method.
        // The subscription becomes past_due. Notify your customer and send them to the
        // customer portal to update their payment information.
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case 'payment_intent.created':
        console.log(`Payment Intent was created!`);
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }

    return ctx.send({status: 200});
  }
};

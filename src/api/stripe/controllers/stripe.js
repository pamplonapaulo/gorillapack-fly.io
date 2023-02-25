'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

module.exports = {
  customer: async (ctx, next) => {
    const { name, email, phone } = ctx.request.body

    console.log(name, email, phone)

    try {
      const customer = await stripe.customers.create({
        name,
        email,
        phone,
      });
      console.log('customer')
      console.log(customer)

      return customer.id
    } catch (err) {
      console.log('stripe err')
      console.log(err)

      ctx.body = err;
    }
  },
  /*
  order: async (ctx, next) => {

    const Stripe = require('stripe');
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27; orders_beta=v4',
    });

    const { name, email, phone } = ctx.request.body

    try {
      const order = await stripe.orders.create({
        currency: 'brl',
        line_items: [
          {product: 'prod_M9ErQKmFfp2lX7', quantity: 10},
        ],
        expand: ['line_items'],
        shipping_cost: {
          shipping_rate_data: {
            display_name: 'Ground shipping',
            type: 'fixed_amount',
            fixed_amount: {amount: 700, currency: 'usd'},
          },
        },
      });
      return order
    } catch (err) {
      ctx.body = err;
    }
  },
  checkout: async (ctx, next) => {

  },
  schedule: async (ctx, next) => {

  },
  */
};

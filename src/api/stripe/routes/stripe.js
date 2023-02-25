module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/stripe',
     handler: 'stripe.customer',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

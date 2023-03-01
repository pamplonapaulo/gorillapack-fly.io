module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/coupon-handler',
     handler: 'coupon-handler.take',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

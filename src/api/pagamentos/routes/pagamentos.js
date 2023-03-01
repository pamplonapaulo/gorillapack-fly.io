module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/pagamentos',
     handler: 'pagamentos.event',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

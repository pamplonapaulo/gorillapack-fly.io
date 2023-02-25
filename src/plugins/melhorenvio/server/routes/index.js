module.exports = [
  {
    method: 'GET',
    path: '/credentials',
    handler: 'melhorenvio.fetchCredentials',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/credentials',
    handler: 'melhorenvio.updateCredentials',
    config: {
      auth: false,
      policies: [],
    },
  },
];

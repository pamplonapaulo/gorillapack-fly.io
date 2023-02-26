module.exports = ({ env }) => ({
  melhorenvio: {
    enabled: true,
    resolve: "./src/plugins/melhorenvio",
  },
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'adm.gorillapack@gmail.com',
        defaultReplyTo: 'adm.gorillapack@gmail.com',
      },
    },
  },
});

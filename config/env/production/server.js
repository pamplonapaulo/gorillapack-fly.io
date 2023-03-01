module.exports = ({ env }) => ({
  url: env('BACKEND_URL'),
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
});

'use strict';

module.exports = ({ strapi }) => ({
  getContentTypes() {
    return strapi.contentTypes;
  },
  async getMelhorEnvioCredentials() {
    const entries = await strapi.entityService.findMany('api::melhor-envio.melhor-envio', {
      populate: '*',
    });
    return entries.client_secret;
  },
});

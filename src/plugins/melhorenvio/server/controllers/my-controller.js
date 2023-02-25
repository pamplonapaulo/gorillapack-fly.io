'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('melhorenvio')
      .service('myService')
      .getWelcomeMessage();
  },
});

'use strict';

/**
 * delivery-fee router.
 */

// const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::delivery-fee.delivery-fee');
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/delivery',
      handler: 'delivery.getDeliveryFee',
      config: {
        auth: false,
      },
    },
  ],
};

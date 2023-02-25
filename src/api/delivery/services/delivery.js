'use strict';

/**
 * delivery-fee service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::delivery.delivery');

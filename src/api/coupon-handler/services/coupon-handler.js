'use strict';

/**
 * couponHandler service.
 */

 const { createCoreService } = require('@strapi/strapi').factories;

 module.exports = createCoreService('api::coupon-handler.coupon-handler');

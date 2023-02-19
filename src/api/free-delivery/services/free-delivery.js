'use strict';

/**
 * free-delivery service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::free-delivery.free-delivery');

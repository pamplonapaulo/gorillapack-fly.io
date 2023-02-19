'use strict';

/**
 * dispatch controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::dispatch.dispatch');

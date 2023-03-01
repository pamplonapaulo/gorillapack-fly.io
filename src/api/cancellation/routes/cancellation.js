'use strict';

/**
 * cancellation router.
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/cancellation',
      handler: 'cancellation.cancel',
    },
  ],
};

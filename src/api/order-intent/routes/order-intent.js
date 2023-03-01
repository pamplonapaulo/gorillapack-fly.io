'use strict';

/**
 * order-intent router.
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orderIntent',
      handler: 'order-intent.create',
    },
  ],
};

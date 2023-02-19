'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
   register({ strapi }) {
    const { toEntityResponseCollection } = strapi.plugin("graphql").service("format").returnTypes;
    const { getContentTypeArgs } = strapi.plugin("graphql").service("builders").utils;

    const extensionService = strapi.plugin("graphql").service("extension");

    extensionService.use(({ nexus }) => ({
      types: [
        nexus.extendType({
          type: "UsersPermissionsMe",
          definition(t) {
            t.string("addressComplement");
            t.string("addressNumber");
            t.string("phone");
            t.string("postCode");
            t.string("stripe_customer");
            t.string("updatedAt");
            t.field("order", {
              type: "OrderRelationResponseCollection",
              args: getContentTypeArgs(
                strapi.contentTypes["api::order.order"]
              ),
              resolve: async (root, args) => {
                const orders = await strapi.query('api::order.order').findMany({
                  where: {
                    user: root.id,
                    isConfirmed: args.filters.isConfirmed.eq,
                    deactivated: args.filters.deactivated.eq
                  },
                  fields: [
                    'title',
                    'deactivated',
                    'isConfirmed',
                    'createdAt',
                    'updatedAt',
                    'deactivationAuthor',
                    'paymentIntent'
                  ],
                  populate: [
                    'snack',
                    'snack.product',
                    'pack',
                    'address',
                    'deliveries',
                    'period',
                    'user',
                    'coupon',
                    'expectedPayments',
                    'deliveries.expectedDispatchDays',
                    'deliveries.expectedArrivalDays'
                  ],
                });

                const order = orders.pop()

                if (!order) {
                  return toEntityResponseCollection(null, {
                    resourceUID: "api::user.me",
                  });
                } else {
                  return toEntityResponseCollection([{
                    id: order.id,
                    title: order.title,
                    isConfirmed: order.isConfirmed,
                    deactivated: order.deactivated,
                    deactivationAuthor: order.deactivationAuthor,
                    createdAt: order.createdAt,
                    address: order.address,
                    expectedPayments: order.expectedPayments,
                    period: order.period,
                    snack: order.snack,
                    paymentIntent: order.paymentIntent
                  }], {
                    resourceUID: "api::user.me",
                  });
                }
              },
            });
          },
        }),
      ],
    }));
  },
  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
};

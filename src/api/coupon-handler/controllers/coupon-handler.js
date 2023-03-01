'use strict';

/**
 * coupon-handler controller
 */

var jwt = require('jsonwebtoken')

module.exports = {
  take: async (ctx) => {

    const token = ctx.request.headers.authorization.split(' ')[1]
    const userID = jwt.decode(token).id
    const { name } = ctx.request.body

    const updateOrder = async (order, coupon, expectedPayments) => {
      try {
        await strapi.entityService.update('api::order.order', order, {
          data: {
            coupon,
            expectedPayments
          },
        });
        return { success: expectedPayments}
      } catch(err) {
        ctx.throw(err.status, 'Fail putting coupon on order')
      }
    }

    const calculateDiscount = (orderID, coupon, expectedPayments) => {
      let absoluteCouponDiscountAppliedInCentavos
      let finalValueInCentavosWithCoupon

      if (coupon.type === 'absoluteValue') {
        absoluteCouponDiscountAppliedInCentavos = coupon.discount * 100
        finalValueInCentavosWithCoupon = expectedPayments.finalValueInCentavos - absoluteCouponDiscountAppliedInCentavos
      }

      if (coupon.type === 'percentage') {
        absoluteCouponDiscountAppliedInCentavos = parseInt(coupon.discount * expectedPayments.finalValueInCentavos)
        finalValueInCentavosWithCoupon = expectedPayments.finalValueInCentavos - absoluteCouponDiscountAppliedInCentavos
      }

      expectedPayments = {
        ...expectedPayments,
        finalValueInCentavos: parseInt(expectedPayments.finalValueInCentavos),
        absoluteCouponDiscountAppliedInCentavos,
        finalValueInCentavosWithCoupon
      }

      return updateOrder(orderID, coupon.id, expectedPayments)
    }

    const getOrder = async (coupon) => {
      try {
        const orders = await strapi.query('api::order.order').findMany({
          where: {
            user: userID,
            isConfirmed: false,
            deactivated: false
          },
          populate: ['expectedPayments'],
        })

        const order = orders.pop()
        return calculateDiscount(order.id, coupon, order.expectedPayments)
      } catch(err) {
        ctx.throw(err.status, 'Order before payment not found')
      }
    }

    const keepCouponBeforePayment = async (obj) => {
      try {
        await strapi.entityService.update('api::coupon.coupon', obj.id, {
          data: {
            notTaken: obj.notTaken - 1,
            takenBeforePayment: obj.takenBeforePayment + 1,
          },
        });
        return getOrder(obj)
      } catch(err) {
        ctx.throw(err.status, 'Fail taking coupon')
      }
    }

    const checkAvailability = (obj) => {
      if (obj.notTaken > 0) {
        return keepCouponBeforePayment(obj)
      } else {
        ctx.throw(404, 'Coupon sold out')
      }
    }

    const discardTime = (date) => new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )

    const checkExpiration = async (obj) => {
      const today = discardTime(new Date())
      const expiration = discardTime(new Date(obj.expiration))
      expiration.setDate(expiration.getDate() + 1)

      if (today < expiration) {
        return checkAvailability(obj)
      } else {
        ctx.throw(404, 'Coupon expired')
      }
    }

    const getCoupon = async () => {
      try {
        const activeCoupon = await strapi.query('api::coupon.coupon').findOne({
          where: {
            name,
            isActive: true,
          }
        })
        return checkExpiration(activeCoupon)
      } catch (err) {
        ctx.throw(err.status, 'Coupon not found')
      }
    }

    return getCoupon()
  }
};

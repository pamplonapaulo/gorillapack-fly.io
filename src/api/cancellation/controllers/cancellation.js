'use strict';

/**
 *  cancellation controller
 */

var jwt = require('jsonwebtoken')

module.exports = {
  cancel: async (ctx) => {

    const token = ctx.request.headers.authorization.split(' ')[1]
    const userID = jwt.decode(token).id
    const { type } = ctx.request.body

    const cancelOrder = async (orderID) => {
      try {
        const cancelled = await strapi.entityService.update('api::order.order', orderID, {
          data: {
            deactivated: true,
            deactivationAuthor: 'customer',
          },
        });
        return cancelled
      } catch(err) {
        ctx.throw(err.status, err.message)
      }
    }

    const updateOrder = async (orderID, numero, complemento, address) => {
      try {
        const updatedOrder = await strapi.entityService.update('api::order.order', orderID, {
          data: {
            address: {
              ...address,
              numero,
              complemento
            }
          },
        });
        return updatedOrder
      } catch(err) {
        ctx.throw(err.status, err.message)
      }
    }

    const getOrderID = async () => {
      const isConfirmed = type === 'updateUserAndOrder' ? false : true

      try {
        const orders = await strapi.query('api::order.order').findMany({
          where: {
            user: userID,
            deactivated: false,
            isConfirmed
          },
          populate: [
            'address'
          ]
        })
        const order = orders.pop()
        return isConfirmed ? cancelOrder(order.id) : updateUser(true, order.id, order.address)
      } catch(err) {
        ctx.throw(err.status, 'Order not found')
      }
    }

    const cancelUser = async () => {
      try {
        const cancelled = await strapi.query('plugin::users-permissions.user').update({
          where: { id: userID },
          data: {
            blocked: true,
            confirmed: false
          },
        });
        return cancelled
      } catch(err) {
        ctx.throw(err.status, err.message)
      }
    }

    const updateUser = async (updateOrderToo = false, orderID, address) => {
      const { data } = ctx.request.body

      try {
        const updatedUser = await strapi.query('plugin::users-permissions.user').update({
          where: { id: userID },
          data,
        });

        return updateOrderToo ? updateOrder(orderID, data.addressNumber, data.addressComplement, address) : updatedUser
      } catch(err) {
        ctx.throw(err.status, err.message)
      }
    }

    const validateUser = async () => {
      try {
        const user = await strapi.query('plugin::users-permissions.user').findOne({
          where: {
            id: userID,
            blocked: false,
            confirmed: true
          }
        });

        if (user && type === 'updateUser') return updateUser()
        if (user && type === 'cancelUser') return cancelUser()
        if (user && type === 'cancelOrder' || type === 'updateUserAndOrder') return getOrderID()

      } catch(err) {
        ctx.throw(err.status, err.message)
      }
    }

    return validateUser()
  },
};

'use strict';

/**
 *  order-intent controller
 */

const axios = require('axios')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const { getDeliveryFee } = require('../../delivery/controllers/delivery')

module.exports = {
  create: async (ctx) => {

      const { users_permissions_user, period, snack, pack, postCode } = ctx.request.body

      let customer

      let data = {
        user: users_permissions_user,
        Title: 'Customizado',
        pack,
        snack,
        period,
        deliveries: {},
        address: {},
        expectedPayments: {
          absoluteDiscountApplied: 0,
          finalValueInCentavos: 0,
          monthsMultiplier: 0,
          contentCostBeforeDiscount: null
        },
        paymentIntent: '0',
        cardBrand: '0',
        cardLast4digits: '1234',
        line_items: []
      }

      let orderMath = {
        snacksTotal: 0,
        subscription: {
          multiplier: null,
          percentualDiscount: 0,
          absoluteDiscount: 0
        },
      }

      const saveOrderIntent = async () => {
        try {
          const order = await strapi.service('api::order.order').create({data})
          return order.id
        } catch(err) {
          ctx.throw(err.status, err.message)
        }
      }

      /*
      const getStripeIntent = async () => {
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: data.expectedPayments.finalValueInCentavos,
            currency: 'brl',
            automatic_payment_methods: {enabled: true},
            metadata: {
              pack: data.Title
            }
          })
          data.paymentIntent = paymentIntent.client_secret

          return saveOrderIntent()
        } catch(err) {
          ctx.throw(err.raw.statusCode, err.raw.message)
        }
      }
      */

      const createStripeSchedule = async () => {
        try {
          const subscriptionSchedule = await stripe.subscriptionSchedules.create({
            customer,
            start_date: 1659408846,
            end_behavior: 'release',
            phases: [
              {
                items: [
                  {
                    price: 'price_1LPc4oFypReVTFFM1BPmzmgf',
                    quantity: 5,
                  },
                ],
                iterations: data.period.times,
                automatic_tax: {
                  enabled: true
                }
              },
            ],
          });

          console.log(subscriptionSchedule)
          return subscriptionSchedule
        } catch(err) {
          console.log(err)
          ctx.throw(err.raw.statusCode, err.raw.message)
        }
      }

      const createStripeCheckoutSession = async () => {

        console.log('data.deliveries')
        console.log(data.deliveries)

        try {
          const session = await stripe.checkout.sessions.create({
            customer,
            mode: "subscription",
            currency: 'brl',
            payment_method_types: ['card'],
            shipping_options: [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: {
                    amount: data.deliveries.fee,
                    currency: 'brl',
                  },
                  display_name: data.deliveries.company,
                  delivery_estimate: {
                    minimum: {
                      unit: 'business_day',
                      value: data.deliveries.delivery_range.min,
                    },
                    maximum: {
                      unit: 'business_day',
                      value: data.deliveries.delivery_range.max,
                    },
                  }
                }
              },
            ],
            line_items: data.line_items,
            success_url: `${process.env.FRONTEND_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/canceled.html`,
            // automatic_tax: { enabled: true }
          });

          console.log(session)

          ctx.redirect(session.url)
          ctx.status = 303
          //return res.redirect(303, session.url);
        } catch (e) {
          ctx.throw(e.status, e.message)
        }
      }

      const renameSnackProp = (snks) => {
        const products = []
        snks.map((s) => {
          products.push({
            Quantity: s.Quantity,
            product: s.id
          })
        })
        data.snack = products

        return createStripeCheckoutSession() // needs Stripe account totally set
        //return createStripeSchedule() // never tested
        //return getStripeIntent() // single payment was working at first tests
      }

      const handleCalendar = async () => {
        const today = new Date().getDate()
        let month = new Date().getMonth()
        let year = new Date().getFullYear()
        let dayOfMonth
        const expectedDispatchDays = []
        const expectedArrivalDays = []

        const { Day1, Day2, SafetyTimeSpan } = await strapi.service('api::dispatch.dispatch').find()

        let dispatches = [ Number(Day1), Number(Day2) ]

        // reverse loop: overrides the result with the beginning of the month when possible
        for (let i=dispatches.length-1; i>=0; i--) {
          // Check if first dispatch can happen in the current month
          if (today + SafetyTimeSpan < dispatches[i]) {
            dayOfMonth = dispatches[i]
          }
        }

        // condition is true when dispatch can't happen in the current month
        if (!dayOfMonth) {
          year = month === 11 ? year+1 : year
          month = month === 11 ? 0 : month+1
          dayOfMonth = dispatches[0]
        }

        for (let i=1; i<=orderMath.subscription.multiplier; i++) {

          expectedDispatchDays.push({
            isDispatched: false,
            date: new Date(year + '-' + (month+1) + '-' + dayOfMonth).toISOString().substring(0, 10)
          })

          let arrival = new Date(year, month, dayOfMonth + data.deliveries.expectedTravelingDays)

          // Check if arrival would be on Sunday, then fix it to Monday'
          if (arrival.getDay() === 0) {
            arrival = new Date(year, month, dayOfMonth + data.deliveries.expectedTravelingDays + 1)
          }

          // Check if arrival would be on Saturday, then fix it to Monday
          if (arrival.getDay() === 6) {
            arrival = new Date(year, month, dayOfMonth + data.deliveries.expectedTravelingDays + 2)
          }

          const dateStr = arrival.getFullYear() + '-' + (arrival.getMonth()+1) + '-' + arrival.getDate()

          expectedArrivalDays.push({
            hasArrived: false,
            date: new Date(dateStr).toISOString().substring(0, 10)
          })

          year = month === 11 ? year+1 : year
          month = month === 11 ? 0 : month+1
        }

        data.deliveries.expectedArrivalDays = expectedArrivalDays
        data.deliveries.expectedDispatchDays = expectedDispatchDays

        if(data.snack.length > 0) {
          return renameSnackProp(data.snack)
        } else {
          return saveOrderIntent()
        }
      }

      // must refactor this. somehow it's result's typeof is string
      const convertToCents = (num) => parseInt(num.toFixed(2).toString().replace(/(\d{1,})(\.)(\d{1,2})/g, '$1' + '$3'))

      const getExpectedPayments = () => {
        // data.expectedPayments.contentCostBeforeDiscount = orderMath.snacksTotal
        // data.expectedPayments.finalValueInCentavos = convertToCents((orderMath.snacksTotal - orderMath.subscription.absoluteDiscount) + data.deliveries.fee)
        data.expectedPayments.finalValueInCentavos = orderMath.snacksTotal + convertToCents(data.deliveries.fee)
        data.deliveries.fee = parseInt(data.deliveries.fee.toString().replace('.',''))
        return handleCalendar()
      }

      const calculateDelivery = async (snacks) => {
        const deliveryData = await getDeliveryFee({
          request: {
            body: {
              dropOffPostCode: postCode,
              pack: snacks
            }
          }
        })

        data.deliveries = { ...deliveryData.quotation }
        data.address = {
          ...deliveryData.address,
          nome: data.address.nome,
          numero: data.address.numero,
          complemento: data.address.complemento
        }

        return getExpectedPayments()
      }

      const getSubtotalFromSnacks = async (snacks, packDiscount = 0) => {

        await Promise.all(
          snacks.map(async (snack) => {
            const item = await strapi.query('api::product.product').findOne({
              where: { id: snack.id },
              populate: [`prices.${data.period.name}`],
            });
            const price = item.prices[data.period.name].centavos
            const priceId = item.prices[data.period.name].priceId

            orderMath.snacksTotal += (snack.Quantity * price)
            data.line_items.push({
              price: priceId,
              quantity: snack.Quantity,
            })
          })
        )
        orderMath.snacksTotal = orderMath.snacksTotal - (packDiscount * orderMath.snacksTotal)
        return calculateDelivery(snacks)
      }

      const storeSnacksTemp = (arr) => {
        data.snack = arr
      }

      const regroupSnacksProps = (arr) => {
        const snks = []
        arr.map((s) => {
          snks.push({
            "id": Number(s.product.data.id),
            "Quantity": s.Quantity
          })
        })
        storeSnacksTemp(snks)
        return snks
      }

      const getSnacksFromPack = async () => {

        const packData = await axios.post(process.env.BACKEND_URL + 'graphql', {
          query: `query packs {
            pack(id: ${pack}) {
              data {
                id
                attributes {
                  Name
                  ExtraDiscount
                  Item {
                    Quantity
                    product {
                      data {
                        id
                      }
                    }
                  }
                }
              }
            }
          }`
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        data.Title = packData.data.data.pack.data.attributes.Name

        return getSubtotalFromSnacks(
          regroupSnacksProps(packData.data.data.pack.data.attributes.Item),
          packData.data.data.pack.data.attributes.ExtraDiscount
        )
      }

      const handlePackType = () => {
        if (!snack && pack) return getSnacksFromPack()
        if (!pack && snack) return getSubtotalFromSnacks(snack)
      }

      const getSubscriptionCycle = async () => {
        const subscription = await strapi.query('api::period.period').findOne({
          where: { id: period }
        });

        data.period = {
          name: subscription.Type,
          times: subscription.Multiplier
        }

        // data.expectedPayments.monthsMultiplier = subscription.Multiplier
        // orderMath.subscription.multiplier = subscription.Multiplier
        // orderMath.subscription.percentualDiscount = subscription.Discount
        // orderMath.subscription.absoluteDiscount = subscription.Discount * orderMath.snacksTotal
        // data.expectedPayments.absoluteDiscountApplied = orderMath.subscription.absoluteDiscount
        //return getExpectedPayments()


        return handlePackType()
      }

      const getAddressExtraFieldsIfAvailable = (numero, complemento) => {
        if (numero) data.address.numero = numero
        if (complemento) data.address.complemento = complemento
        //return handlePackType()
        return getSubscriptionCycle()
        //return preventAnotherActiveOrder(users_permissions_user)
      }

      const confirmPostcodeMatch = async () => {
        try {
          const user = await strapi.query('plugin::users-permissions.user').findOne({
            where: { id: users_permissions_user }
          });

          const postCodeNoDash = user.postCode.slice(0, 5) + user.postCode.slice(6, 10);

          if (postCode === postCodeNoDash) {
            customer = user.stripe_customer
            data.address.nome = user.username
            return getAddressExtraFieldsIfAvailable(user.addressNumber, user.addressComplement)
          } else {
            ctx.throw(409, 'PostCode Conflit')
          }
        } catch(err) {
          ctx.throw(err.status, err.message)
        }
      }

      const preventAnotherActiveOrder = async () => {
        try {
          const activeOrder = await strapi.query('api::order.order').findOne({
            where: { user: users_permissions_user, deactivated: false, isConfirmed: true },
          })

          if (activeOrder === null) {
            return confirmPostcodeMatch()
          } else {
            ctx.throw(409, 'Duplication Conflit')
          }
        } catch(err) {
          ctx.throw(err.status, err.message)
        }
      }

      return preventAnotherActiveOrder()
    },
};

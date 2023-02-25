'use strict';

const axios = require('axios');

/**
 *  delivery-fee controller
 */

module.exports = {
  getDeliveryFee: async (ctx) => {
      const { dropOffPostCode, pack } = ctx.request.body
      const gorillaPostCode = '20756190'
      let address
      let orderPrice = 0
      let noFee = false
      let gorillaLog = false
      let data = {
        from: {
          postal_code: gorillaPostCode,
        },
        to: {
          postal_code: dropOffPostCode,
        },
        products: [],
      }

      const getCredentials = async (fields) => {
        const credentials = await strapi.db.query('api::melhor-envio.melhor-envio').findOne({
          select: fields,
          populate: { category: true },
        });
        return credentials
      }

      const sendResponse = (arr) => {

        if (arr.length === 0) {
          return { error: 'Selecione menos produtos.' }
        } else {
          const data = {
            quotation: {
              fee: noFee ? 0 : Number(arr[0].custom_price),
              expectedTravelingDays: gorillaLog ? 0 : arr[0].delivery_time,
              delivery_range: arr[0].delivery_range,
              company: gorillaLog ? 'Gorilla Pack' : arr[0].company.name,
              packingDetails: gorillaLog ? undefined : arr[0].packages
            },
            address : {
              ...address
            }
          }
          return data
        }
      }

      const removeBlankQuotations = (arr) => {
        let blanks = 0
        for (let i = 0; i < arr.length; i++) {
          if (!!arr[i].error) {
            blanks++
          }
        }
        arr.splice(0, blanks);
        return sendResponse(arr)
      }

      const sortByLowestPrice = async (quotations) => {
        const newArr = await quotations.sort(function (a, b) {
          return a.custom_price - b.custom_price
        })
        return removeBlankQuotations(newArr)
      }

      const saveNewToken = async (updatedToken) => {
        await strapi.query('api::melhor-envio.melhor-envio').update({
          where: { id: 1 },
          data: {
            access_token: updatedToken.access_token,
            refresh_token: updatedToken.refresh_token
          },
        })

        // Saved above, then start again bellow:
        return requestMelhorEnvio(
          undefined,
          'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
          sortByLowestPrice,
          data.products,
          // JSON.stringify(data.products),
        )
      }

      const requestMelhorEnvio = async (grant_type, url, callBack, dataObj) => {

        const options = {
          url,
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          data: {
            ...data
          }
        }

        if (grant_type === undefined) {
          const access_token = await getCredentials(['access_token'])

          options.data.products = dataObj
          options.headers['Authorization'] = `Bearer ${access_token.access_token}`
        } else {
          options.data['grant_type'] = grant_type
        }

        if (grant_type === 'refresh_token') {
          const creds = await getCredentials(['access_token', 'refresh_token', 'client_id', 'client_secret'])
          options.data.refresh_token = creds.refresh_token
          options.data.client_id = creds.client_id
          options.data.client_secret = creds.client_secret
        }

        try {
          const res = await axios(options)
          return callBack(res.data)
        } catch (error) {
          console.log('About to handle error: ', error.response.data.message)
          return handleErrors(error.response.data)
        }
      }

      const handleErrors = (msg) => {
        if (msg.message === 'Unauthenticated.') {
          console.log('// trying REFRESH TOKEN')
          return requestMelhorEnvio(
            'refresh_token',
            'https://sandbox.melhorenvio.com.br/oauth/token',
            saveNewToken
          )
        }

        if (msg === 'Token has been revoked' || msg === 'Error.') {
          console.log('// trying AUTHORIZATION CODE')
          return requestMelhorEnvio(
            'authorization_code',
            'https://sandbox.melhorenvio.com.br/oauth/token',
            saveNewToken
          )
        }

        if (msg === 'Client authentication failed.') {
          console.log('// trying REFRESH TOKEN')
          return requestMelhorEnvio(
            'refresh_token',
            'https://sandbox.melhorenvio.com.br/oauth/token',
            saveNewToken
          )
        }

        if (msg === 'Authorization code has expired.') {
          console.log('// Please manually register again the Melhor Envio Plugin')
          return 'Authorization code has expired. Gorilla Pack must register the plugin again.'
        }
      }

      const validatePack = async (freeDeliveryValue, promotionZone) => {
        await Promise.all(
          pack.map(async (snack) => {
            const validatedSnack = await strapi.query('api::product.product').findOne({
              where: { id: snack.id },
            });

            if(validatedSnack) {
              const product = {
                id: validatedSnack.id,
                width: validatedSnack.Width,
                height: validatedSnack.Height,
                length: validatedSnack.Length,
                weight: validatedSnack.Weight / 1000,
                insurance_value: 0,
                quantity: snack.quantity,
              }
              orderPrice += validatedSnack.BaseValue * parseInt(product.quantity)
              data.products.push(product)
            }
          })
        )

        if(freeDeliveryValue <= orderPrice && promotionZone) {
          noFee = promotionZone
        }

        return requestMelhorEnvio(
          undefined,
          'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
          sortByLowestPrice,
          data.products,
          // JSON.stringify(data.products),
        )
      }

      const getPromotionZone = (uf) => {
        if (
          uf === 'RJ' ||
          uf === 'MG' ||
          uf === 'SP' ||
          uf === 'ES'
        ) {
          return true
        } else {
          return false
        }
      }

      const getGratuityByOrderPrice = async (uf) => {
        const value = await strapi.service('api::free-delivery.free-delivery').find()
        return validatePack(value.MinimumTicket, getPromotionZone(uf))
      }

      const getGratuityByCity = (data) => {
        if(data.localidade === "Rio de Janeiro" || data.localidade === "Niterói"){
          noFee = true
          gorillaLog = true
          return sendResponse(['Skipping Melhor Envio quotation'])
        } else {
          if (dropOffPostCode.length === 8) {
            return getGratuityByOrderPrice(data.uf)
          }
        }
      }

      const getAddress = async () => {
        let data
        try {
          const response = await axios.get(`https://viacep.com.br/ws/${dropOffPostCode}/json/`)
          data = response.data
        } catch (error) {
          data = error.message
        }
        address = {
          cep: data.cep,
          logradouro: data.logradouro,
          bairro: data.bairro,
          municipio: data.localidade,
          uf: data.uf,
        }
        return getGratuityByCity(data)
      }

      return getAddress()
  },
}

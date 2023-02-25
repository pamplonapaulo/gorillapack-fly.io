'use strict';

import buildBlob from '../utils/buildBlob'

const axios = require('axios')

const domain = 'https://sandbox.melhorenvio.com.br/'

export const sortByLowestPrice = (quotations) => {
  const newArr = quotations.sort(function (a, b) {
    return a.custom_price - b.custom_price
  })
  return newArr
}

export const fetchProducts = async () => {

  const query = `query products {
    products {
      data {
        id
        attributes {
          Name
          BaseValue
          Weight
          Width
          Height
          Length
          Image {
            data {
              attributes {
                url
                hash
                ext
              }
            }
          }
        }
      }
    }
  }`

  try {
    const obj = await axios.post(
      process.env.GRAPHQL_HOST,
      { query },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    const res = buildBlob(obj)
    return res
  } catch (err) {
    throw new Error(err.message, { cause: err })
  }
}

export const sendRequest = async (creds, grant_type, body) => {
  const url = domain + (grant_type === 'shipping_calculate' ? 'api/v2/me/shipment/calculate' : 'oauth/token');
  let headers = {
    'Accept': 'application/json',
  }
  let data

  if (grant_type === 'shipping_calculate') {
    headers['Content-Type'] = 'application/json'
    headers['Authorization'] = `Bearer ${creds.access_token}`
    data = body
  } else {
    data = {
      grant_type,
      'client_id': creds.client_id,
      'client_secret': creds.client_secret
    }
  }

  if (grant_type === 'refresh_token') {
    data['refresh_token'] = `Bearer ${creds.refresh_token}`
  }

  if (grant_type === 'authorization_code') {
    data['redirect_uri'] = creds.redirect_uri,
    data['code'] = creds.authorization_code
  }

  const options = {
    url,
    method: 'POST',
    headers,
    data
  }

  try {
    const obj = await axios(options)
    const res = buildBlob(obj)
    return res
  } catch (err) {
    throw new Error(err.message, { cause: err })
  }
}

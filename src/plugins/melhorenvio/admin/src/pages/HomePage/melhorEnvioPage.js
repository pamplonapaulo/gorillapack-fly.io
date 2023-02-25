/*
 *
 * HomePage Melhor Envio Plugin
 *
 */

import React, { useEffect, useState, memo } from 'react';
import * as S from './styles';
import { fetchCredentials, updateCredentials } from '../../utils/api';

import Brand from '../../components/Brand';

import { fetchProducts, sendRequest, sortByLowestPrice } from '../../utils/testMelhorEnvio';

const HomePage = () => {

  const [credentials, setCredentials] = useState({})
  const [authorization_code, setAuthorizationCode] = useState(undefined)
  const [access_token, setAccessToken] = useState(undefined)
  const [refresh_token, setRefreshToken] = useState(undefined)

  const [request, setRequest] = useState(undefined)

  const [bestPrice, setBestPrice] = useState(undefined)
  const [packingRules, setPackingRules] = useState(undefined)
  const [deliveryTime, setDeliveryTime] = useState(undefined)
  const [cheapestCompany, setCheapestCompany] = useState(undefined)

  const [finished, setFinished] = useState(undefined)

  const [reFetch, setReFetch] = useState(false)

  const [products, setProducts] = useState([])

  const [cepOrigin, setCepOrigin] = useState('20756-190')
  const [cepDestiny, setCepDestiny] = useState('26650-000')

  const [missingParams, setMissingParams] = useState({
    noOrigin: undefined,
    noDestiny: undefined,
    noProduct: undefined
  })
  const [alertMessage, setAlertMessage] = useState()

  useEffect(async () => {
    document.title = "Melhor Envio | Gorilla Pack";
    try {
      const response = await fetchProducts()
      const result = await response.json()

      let db = result.data.data.products.data
      const bag = []

      for (let i = 0; i < db.length; i++) {
        const snack = {
          id: db[i]['id'],
          name: db[i]['attributes']['Name'],
          width: db[i]['attributes']['Width'],
          height: db[i]['attributes']['Height'],
          length: db[i]['attributes']['Length'],
          weight: db[i]['attributes']['Weight'] / 1000,
          insurance_value: 0,
          quantity: i === 0 ? 1 : 0 // initial select to prevent empty bag on request
        }
        bag.push(snack)
      }
      setProducts(bag)
      watchPathname(window.location.href)
    } catch (err) {
      throw new Error(err.message, { cause: err })
    }
  },[])

  useEffect(async () => {
    if (!products.some(checkBagContent)) {
      setMissingParams({
        ...missingParams,
        noProduct: '  ·   Selecione ao menos 1 produto'
      })
    } else {
      setMissingParams({
        ...missingParams,
        noProduct: undefined
      })
    }
  }, [products]);

  useEffect(async () => {
    if (cepOrigin.length !== 9) {
      setMissingParams({
        ...missingParams,
        noOrigin: '  ·   CEP de origem inválido'
      })
    } else {
      setMissingParams({
        ...missingParams,
        noOrigin: undefined
      })
    }
  }, [cepOrigin]);

  useEffect(async () => {
    if (cepDestiny.length !== 9) {
      setMissingParams({
        ...missingParams,
        noDestiny: '  ·   CEP de destino inválido'
      })
    } else {
      setMissingParams({
        ...missingParams,
        noDestiny: undefined
      })
    }
  }, [cepDestiny]);

  const hasMissingParams = () => Object.keys(missingParams).some(key => missingParams[key] !== undefined)

  useEffect(async () => {
    if (hasMissingParams()) {
      const newLine = "\r\n"
      let msg = "Para realizar um teste, corrija:"
      msg += newLine + newLine;
      msg += missingParams['noOrigin'] ? missingParams['noOrigin'] : ''
      msg += newLine;
      msg += missingParams['noDestiny'] ? missingParams['noDestiny'] : ''
      msg += newLine;
      msg += missingParams['noProduct'] ? missingParams['noProduct'] : ''
      setAlertMessage(msg);
    } else {
      setAlertMessage();
    }
  }, [missingParams]);

  useEffect(async () => {
    const credents = await fetchCredentials();
    setCredentials(
      {
        ...credents[0]
      }
    );
  }, [reFetch]);

  useEffect(() => {
    setCredentials(
      {
        ...credentials,
        authorization_code
      }
    );
  }, [authorization_code]);

  useEffect(() => {
    setCredentials(
      {
        ...credentials,
        access_token
      }
    );
  }, [access_token]);

  useEffect(() => {
    setCredentials(
      {
        ...credentials,
        refresh_token
      }
    );
  }, [refresh_token]);

  const postcodeMask = (brazilianPostCode) =>
  brazilianPostCode
    .replace(/\D+/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')

  const filterTypes = (arr) => {
    if (arr.length === 2 && arr.filter(value => value === 'access_token')) return ['shipping_calculate']
    if (arr.length === 1) return arr
  }

  const handleSave = async (obj) => {
    try {
      const response = await updateCredentials(obj);
      const result = await response.json()
      console.log(result)
      setReFetch(!reFetch)
      return handleSuccess('update_credentials', obj)
    } catch(err) {
      handleErrors('update_credentials')
      throw new Error(err.message, { cause: err });
    }
  }

  const watchPathname = (path) => {
    const regex = /(\?|\&)([^=]+)\=([^&]+)/g;
    const params = [...path.matchAll(regex)];

    if (params.length > 0 && params[0][2] === 'code') {
      return handleSave({ authorization_code: params[0][3] })
    }
  }

  const dropEmptyItems = (arr) => {
    const bag = []
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].quantity !== 0) {
        bag.push(arr[i])
      }
    }
    return bag
  }

  const checkBagContent = (prod) => {
    return prod.quantity > 0
  }

  const callMelhorEnvio = async (creds, type) => {
    setRequest(type[0])
    let body
    if (type[0] === 'shipping_calculate') {
      body = {
        from: {
          postal_code: cepOrigin.replace('-', '')
        },
        to: {
          postal_code: cepDestiny.replace('-', '')
        },
        products: dropEmptyItems(products)
      }
    }

    try {
      const response = await sendRequest(creds, type[0], body)
      const result = await response.json()
      return handleSuccess(type[0], result)
    } catch(err) {
      handleErrors(type[0])
      throw new Error(err.message, { cause: err });
    }
  }

  const handleErrors = (err) => {
    if (err === 'shipping_calculate') {
      setAccessToken(false)
      return callMelhorEnvio(credentials, ['refresh_token'])
    }

    if (err === 'refresh_token') {
      setRefreshToken(false)
      setCheapestCompany(false)
      setBestPrice(false)
      setPackingRules(false)
      setDeliveryTime(false)
      setFinished(true)
      // blinkRegisterBtn()
      console.error('You must manually register the plugin again. Click on the button to open Melhor Envio\'s from.')
    }

    if (err === 'authorization_code') {
      setAuthorizationCode(false)
      console.error('You must call the suppor!')
      // return callFatalError()
    }

    if (err === 'update_credentials') {
      console.error('Credentials not saved on Strapi')
    }
  }

  const handleSuccess = (type, result) => {

    if (type === 'update_credentials') {
      callMelhorEnvio(
        {
          ...credentials,
          ...result
        },
        filterTypes(Object.getOwnPropertyNames(result)))
    }

    if (type === 'authorization_code') {
      setAuthorizationCode(credentials.authorization_code)
      handleSave(result)
    }

    if (type === 'refresh_token') {
      setRefreshToken(credentials.refresh_token)
      handleSave(result)
    }

    if (type === 'shipping_calculate') {
      setAccessToken(credentials.access_token)
      const sorted = sortByLowestPrice(result.data)
      setCheapestCompany(sorted[0].company.name)
      setBestPrice(sorted[0].currency + ' ' + sorted[0].price)
      setPackingRules(
        sorted[0].packages[0].dimensions.height + 'cm x ' +
        sorted[0].packages[0].dimensions.length + 'cm x ' +
        sorted[0].packages[0].dimensions.width + 'cm'
      )
      setDeliveryTime(sorted[0].delivery_time + ' dia' + (sorted[0].delivery_time > 1 ? 's' : ''))
      setFinished(true)
    }

  }

  const convertDate = (timestamp) => [new Date(timestamp).toLocaleTimeString('pt-BR'), new Date(timestamp).toLocaleDateString('pt-BR')];

  const showTime = (t) => t.getHours() + ":"
      + (t.getMinutes() < 10 ? '0' : '' ) + t.getMinutes() + " de "
      + t.getDate() + "/"
      + (t.getMonth()+1)  + "/"
      + t.getFullYear();

  const handleBag = (id, newQuantity) => {
    const pack = []
    products.map((p) => {{
      if (p.id === id && newQuantity !== -1) {
        pack.push(
          {
            ...p,
            quantity: newQuantity
          }
        )
      } else {
        pack.push(p)
      }
    }})
    setProducts(pack)
  }

  const handleCepChange = (e) => {
    const target = e.target

    if (target.name === 'origin') setCepOrigin(postcodeMask(target.value))
    if (target.name === 'destiny') setCepDestiny(postcodeMask(target.value))
  }

  const asyncTimeout = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const resetTestResult = async () => {
    await asyncTimeout(75);
    setRequest(undefined)

    await asyncTimeout(75)
    setAuthorizationCode(undefined)

    await asyncTimeout(75)
    setAccessToken(undefined)

    await asyncTimeout(75)
    setAccessToken(undefined)

    await asyncTimeout(75)
    setAccessToken(undefined)

    await asyncTimeout(75)
    setRefreshToken(undefined)

    await asyncTimeout(75)
    setCheapestCompany(undefined)

    await asyncTimeout(75)
    setBestPrice(undefined)

    await asyncTimeout(75)
    setPackingRules(undefined)

    await asyncTimeout(75)
    setDeliveryTime(undefined)

    await asyncTimeout(75)
    setFinished(undefined)

    await asyncTimeout(75)
    callMelhorEnvio(credentials, ['shipping_calculate'])
  }

  const getDeliveryFee = () => {
    if (finished && !hasMissingParams()) {
      resetTestResult()
    }

    if (!finished && !hasMissingParams()) {
      callMelhorEnvio(credentials, ['shipping_calculate'])
    }

    if (hasMissingParams()) {
      alert(alertMessage)
    }
  }

  return (
    <S.Frame>
      <S.OverFlorwHidden>
        <S.Container>
          <Brand />
        </S.Container>

        <S.Container>
          <S.Subtitle>Caso suas credenciais tenham perdido a validade, refaça o cadastro através do botão "Recadastrar". Uma nova aba abrirá o formulário do Melhor Envio. Por segurança, feche a aba do Gorilla Admin antes de submeter o formulário do Melhor Envio. Após confirmar, você será redirecionado de volta ao plugin dentro da loja e novos testes serão executados automaticamente - aguarde o término antes de fechar.</S.Subtitle>

        </S.Container>

        <S.Container>
          <S.Row>
            <S.Column>
              <S.Subtitle>Ações:</S.Subtitle>
              <S.Row>
                <S.Anchor onClick={getDeliveryFee}>
                  <S.Btn isOff={hasMissingParams()}>Cotar frete</S.Btn>
                </S.Anchor>
                <S.Anchor href={`https://sandbox.melhorenvio.com.br/oauth/authorize?client_id=${credentials.client_id}&redirect_uri=${credentials.redirect_uri}&response_type=code&scope=shipping-calculate`} target="_blank">
                  <S.Btn>Recadastrar</S.Btn>
                </S.Anchor>
              </S.Row>
            </S.Column>
            <S.Column>
              <S.Subtitle>CEP da origem:</S.Subtitle>
              <S.InnerContainer>
                <S.PostCode
                  // onFocus={handleFocusIn}
                  type="text"
                  name="origin"
                  pattern="(\d{5})-(\d{3})"
                  value={postcodeMask(cepOrigin)}
                  onChange={handleCepChange}
                  // onBlur={handleFocusOut}
                  // isValid={validation.postCode}
                />
              </S.InnerContainer>
            </S.Column>
            <S.Column>
              <S.Subtitle>CEP do destino:</S.Subtitle>
              <S.InnerContainer>
              <S.PostCode
                  // onFocus={handleFocusIn}
                  type="text"
                  name="destiny"
                  pattern="(\d{5})-(\d{3})"
                  value={postcodeMask(cepDestiny)}
                  onChange={handleCepChange}
                  // onBlur={handleFocusOut}
                  // isValid={validation.postCode}
                />
                {/* <S.PostCode>{'22240-000'}</S.PostCode> */}
              </S.InnerContainer>
            </S.Column>
          </S.Row>
          <S.Row>
            <S.Column>
              <S.InnerRow>
                <S.Column>
                  <S.Subtitle>Status:</S.Subtitle>
                  <S.TestContainer>
                    <S.TestList>
                      <S.TestItem hasPassed={request}>
                        Requisição:<S.Span></S.Span>
                      </S.TestItem>
                      <S.TestItem hasPassed={refresh_token} skipped={access_token}>
                        Authorization Code:<S.Span></S.Span>
                      </S.TestItem>
                      <S.TestItem hasPassed={access_token}>
                        Access Token:<S.Span></S.Span>
                      </S.TestItem>
                      <S.TestItem hasPassed={refresh_token} skipped={access_token}>
                        Refresh Token:<S.Span></S.Span>
                      </S.TestItem>
                      <S.TestItem hasPassed={cheapestCompany} content={cheapestCompany}>
                        Transportadora:<S.Span>{cheapestCompany}</S.Span>
                      </S.TestItem>
                      <S.TestItem hasPassed={bestPrice} content={bestPrice}>
                        Valor da melhor cotação:<S.Span>{bestPrice}</S.Span>
                      </S.TestItem>
                      <S.TestItem hasPassed={packingRules} content={packingRules}>
                        Empacotamento:<S.Span>{packingRules}</S.Span>
                      </S.TestItem>
                      <S.TestItem hasPassed={deliveryTime} content={deliveryTime}>
                        Tempo estimado de viagem:<S.Span>{deliveryTime}</S.Span>
                      </S.TestItem>
                      <S.TestItem hasPassed={finished}>
                        Teste encerrado:<S.Span>{!!finished ? showTime(new Date()) : ''}</S.Span>
                      </S.TestItem>
                    </S.TestList>
                  </S.TestContainer>
                </S.Column>
              </S.InnerRow>
            </S.Column>
            <S.Column>
              <S.Subtitle>Produtos a fretar:</S.Subtitle>
              <S.ProdsWrap>
                {products.map((p) => {
                  return (
                    <S.Prod key={p.id} isOnBag={p.quantity > 0}>
                      <p>{p.name}</p>
                      <div>
                        <div>
                          <p>Width: <span>{p.width} cm</span></p>
                        </div>
                        <div>
                          <p>Height: <span>{p.height} cm</span></p>
                        </div>
                        <div>
                          <p>Length: <span>{p.length} cm</span></p>
                        </div>
                        <div>
                          <p>Weight: <span>{p.weight * 1000} gr</span></p>
                        </div>
                        <div>
                          <p>Insurance: <span>R$ {p.insurance_value}</span></p>
                        </div>
                      </div>

                      <S.Row>
                        <S.Anchor onClick={() => handleBag(p.id, p.quantity - 1)}>
                          <S.Btn>-</S.Btn>
                        </S.Anchor>
                        <div>
                          <p>{p.quantity}</p>
                        </div>
                        <S.Anchor onClick={() => handleBag(p.id, p.quantity + 1)}>
                          <S.Btn>+</S.Btn>
                        </S.Anchor>
                      </S.Row>
                    </S.Prod>
                  )
                })}
              </S.ProdsWrap>
            </S.Column>
          </S.Row>
          <S.Row>
            <S.Column>
              <S.Subtitle>Última atualização:</S.Subtitle>
              <S.InnerContainer>
                <S.Subtitle>{convertDate(credentials.updatedAt)[0]}</S.Subtitle>
                <S.Subtitle>{convertDate(credentials.updatedAt)[1]}</S.Subtitle>
              </S.InnerContainer>
            </S.Column>
            <S.Column>
              <S.Subtitle>Access Token:</S.Subtitle>
              <S.InnerContainer>
                <S.Token>{credentials.access_token}</S.Token>
              </S.InnerContainer>
            </S.Column>

            <S.Column>
              <S.Subtitle>Refresh Token:</S.Subtitle>
              <S.InnerContainer>
                <S.Token>{credentials.refresh_token}</S.Token>
              </S.InnerContainer>
            </S.Column>
          </S.Row>
        </S.Container>
      </S.OverFlorwHidden>
    </S.Frame>
  );
};

export default memo(HomePage);

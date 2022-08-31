const axios = require('axios').default;
const httpStatus = require('http-status');

const ApiError = require('../../utils/ApiError');
const config = require('../../config/config');
const { encryptIpAddress } = require('../../utils/crypto');

const getTokens = async (tokens, keys) => {
  const apiEndpoint = '/api/get-token-info';
  const queryParams = `?keys=${keys}&token=${tokens}`;
  const url = config.blockchainApi.url + apiEndpoint + queryParams;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });
    return response.data;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const getTokenPrice = async (token, price_per) => {
  const apiEndpoint = '/api/get-token-price';
  const queryParams = `?token=${token}&price_per=${price_per}`;
  const url = config.blockchainApi.url + apiEndpoint + queryParams;

  try {
    const priceList = await axios.get(url, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });
    return priceList.data.result;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const updateToken = async (tokenName, role, options) => {
  const apiEndpoint = `/api/update-token-info/${tokenName}`;
  const url = config.blockchainApi.url + apiEndpoint;

  if (!role || !(role === 'admin')) {
    throw new ApiError(httpStatus.UNAUTHORIZED, `Only admin can update token(s)`);
  }

  try {
    const response = await axios.post(url, options, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });
    return response.data;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const calculateTokenAmount = async (token, price) => {
  if (price <= 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Price must be greater than 0.');
  const keys = 'price_per_token';
  const priceObj = await getTokens(token, keys);

  const tokenprice = priceObj.result[0].price_per_token;

  return price / tokenprice;
};

const getCoinPrice = async (coin) => {
  const apiEndpoint = '/api/get-coin-price';
  const url = config.blockchainApi.url + apiEndpoint;

  try {
    const response = await axios.get(url, { headers: { Authorization: encryptIpAddress(config.crypto.currentIP) } });
    if (!response.data.result) {
      throw new ApiError(httpStatus.NOT_FOUND, `Could not fetch coin price.`);
    }
    const requiredCoin = response.data.result.filter((c) => c.symbol === coin);
    return requiredCoin[0].usd;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const calculateCoinAmount = async (coin, price) => {
  const coinPrice = await getCoinPrice(coin);
  return price / coinPrice;
  // if (price <= 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Price must be greater than 0.');
  // const apiEndpoint = '/api/get-coin-price';
  // const url = config.blockchainApi.url + apiEndpoint;

  // try {
  //   const response = await axios.get(url, { headers: { Authorization: encryptIpAddress(config.crypto.currentIP) } });
  //   const requiredToken = response.data.result.filter((coin) => coin.symbol === token);
  //   // console.log(requiredToken);
  //   // console.log(price);
  //   // console.log(price / requiredToken[0].usd);
  //   return price / requiredToken[0].usd;
  // } catch (error) {
  //   throw new ApiError(error.response.data.code, error.response.data.message);
  // }
};

module.exports = {
  getTokens,
  getTokenPrice,
  getCoinPrice,
  updateToken,
  calculateTokenAmount,
  calculateCoinAmount,
};

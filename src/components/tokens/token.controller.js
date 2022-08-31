const httpStatus = require('http-status');
const tokenService = require('./token.service');
const catchAsync = require('../../utils/catchAsync');

const getTokenInfo = catchAsync(async (req, res) => {
  const { token, keys } = req.query;
  const tokens = await tokenService.getTokens(token, keys);
  return res.status(httpStatus.OK).json(tokens);
});

const getTokenPrice = catchAsync(async (req, res) => {
  const { token, price_per } = req.query;
  const priceList = await tokenService.getTokenPrice(token, price_per);
  return res.status(httpStatus.OK).json(priceList);
});

const update = catchAsync(async (req, res) => {
  const { tokenName } = req.params;
  const { role } = req.user;
  const options = req.body;
  const response = await tokenService.updateToken(tokenName, role, options);
  return res.status(httpStatus.OK).json(response);
});

const getTokenAmountByPrice = catchAsync(async (req, res) => {
  const { token, dollar } = req.query;
  let amount = {};
  if (token && token === 'WOLF') {
    amount = await tokenService.calculateTokenAmount(token, dollar);
  } else {
    amount = await tokenService.calculateCoinAmount(token, dollar);
  }
  return res.status(httpStatus.OK).json(amount);
});

module.exports = {
  getTokenInfo,
  getTokenPrice,
  update,
  getTokenAmountByPrice,
};

/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const axios = require('axios');
const httpStatus = require('http-status');

const { userService } = require('../../../services');
const { tokenService } = require('../../tokens');
const goldPointService = require('../goldPoint.service');
const { encryptIpAddress, encryptEmailAddress } = require('../../../utils/crypto');
const config = require('../../../config/config');

const GPExchangeRate = require('./exchangeRate.model');
const GPTxHistory = require('./exchange.history.model');

const ApiError = require('../../../utils/ApiError');

const create = async (args) => {
  let exchangeRate = await GPExchangeRate.findOne({ coin: args.coin }).exec();

  if (exchangeRate) {
    throw new ApiError(httpStatus.CONFLICT, `Coin exchange rate already exists.`);
  }

  exchangeRate = await new GPExchangeRate(args).save();
  return exchangeRate;
};

const updateExchangeRates = async (updateBody) => {
  const results = [];
  for (let i = 0; i < updateBody.length; i += 1) {
    const updateResult = await GPExchangeRate.findOneAndUpdate({ coin: updateBody[i].coin }, updateBody[i], { new: true });
    if (!updateResult) throw new ApiError(httpStatus.NOT_MODIFIED, 'Failed to update exchange rates');
    results.push(updateResult);
  }
  return results;
};

const fetchExchangeRates = async (filter) => {
  const gpExchageRate = await GPExchangeRate.find(filter);
  if (!gpExchageRate) throw new ApiError(httpStatus.NOT_FOUND, 'No Exchange found');

  return gpExchageRate;
};

const getCoinAndBonusAmountByUnit = async (coin, unit) => {
  const exchangeRate = await GPExchangeRate.findOne({ coin });
  if (!exchangeRate) throw new ApiError(httpStatus.NOT_FOUND, `Exchange rate for provided has not been defiened yet.`);
  const coinAmount = unit * exchangeRate.unit;
  const bonusAmount = unit * ((exchangeRate.unit * exchangeRate.bonus) / 100);
  return { coinAmount, bonusAmount };
};

const calculateTokenPrice = async (token, tokenAmount) => {
  let pricePerToken = null;

  if (token === 'WOLF' || token === 'EAGLE' || token === 'SNOW') {
    const price_per = 'token';
    const tokenPrice = await tokenService.getTokenPrice(token, price_per);
    pricePerToken = tokenPrice[0].price_per_token;
  } else if (token === 'BTC' || token === 'ETH') {
    pricePerToken = await tokenService.getCoinPrice(token);
  }

  const totalPrice = tokenAmount * pricePerToken;
  return totalPrice;
};

const getExchangeEvaluationResult = async (coin, unit) => {
  const coinAndBonusAmountByUnit = await getCoinAndBonusAmountByUnit(coin, unit);
  const price = await calculateTokenPrice(coin, coinAndBonusAmountByUnit.coinAmount);
  const goldPointAmount = await goldPointService.getGpAmountByDollarPrice(price);

  return {
    coin,
    unit,
    price,
    goldPointAmount,
    coinAmount: coinAndBonusAmountByUnit.coinAmount,
    bonusAmount: coinAndBonusAmountByUnit.bonusAmount,
    totalCoinAmount: coinAndBonusAmountByUnit.coinAmount + coinAndBonusAmountByUnit.bonusAmount,
  };
};

const getOptions = async (args) => {
  const options = {};
  const isToken = args.coin === 'WOLF' || args.coin === 'EAGLE' || args.coin === 'SNOW';

  options.type = isToken ? 'erc20' : 'coin';
  options.user = args.email;
  options.amount = Number(args.totalCoinAmount);
  options.currency = args.coin;
  options.to_address = args.toAddress;
  options.from_address = args.coin === 'BTC' ? config.admin.btcAddress : config.admin.ethAddress;
  options.transaction_fee = args.transactionFee;
  return options;
};

const performTransaction = async (userId, args) => {
  const apiEndpoint = '/api/transfer';
  const url = config.blockchainApi.url + apiEndpoint;
  const options = await getOptions(args);
  // console.log(options);
  options.transaction_fee = String(options.transaction_fee);
  options.user = encryptEmailAddress(options.user);
  try {
    const goldPointDeductHistory = await goldPointService.deductGoldPoint(userId, args.goldPointAmount);
    const result = await axios.post(url, options, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });
    if (!result || !(result.data.status_code === 200)) {
      await goldPointService.addGoldPoint(userId, args.goldPointAmount);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not exchange Gold Point.');
    }

    return { result, goldPointDeductHistory };
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const storeExchangeHistory = async (user, args, gpBeforeTx, gpAfterTx, txId, status) => {
  const gpTxObj = {
    user,
    txId,
    status,
    gpBeforeTx,
    gpAfterTx,
    coin: args.coin,
    price: args.price,
    toAddress: args.toAddress,
    coinAmount: args.coinAmount,
    bonusAmount: args.bonusAmount,
    totalCoinAmount: args.totalCoinAmount,
    goldPointAmount: args.goldPointAmount,
    unit: args.unit,
    email: user.email,
  };

  const gpTxHistory = new GPTxHistory(gpTxObj);
  const result = await gpTxHistory.save();
  return result;
};

const exchange = async (userId, args) => {
  const user = await userService.getUserById(userId);
  const txResult = await performTransaction(userId, args);
  return storeExchangeHistory(
    user,
    args,
    txResult.goldPointDeductHistory.gpBeforeTx,
    txResult.goldPointDeductHistory.gpAfterTx,
    txResult.result.data.result.txId,
    txResult.result.data.status_code === 200
  );
};

const getTotalExchangedGoldPoint = async () => {
  const total = await GPTxHistory.aggregate([
    { $group: { _id: 'goldPointAmount', TotalExchanged: { $sum: '$goldPointAmount' } } },
  ]);
  return total[0].TotalExchanged;
};

const totalCoinsExchanged = async (coin) => {
  const total = await GPTxHistory.aggregate([
    { $match: { coin } },
    { $group: { _id: 'totalCoinAmount', TotalCoinExchanged: { $sum: '$totalCoinAmount' } } },
  ]);
  return total[0].TotalCoinExchanged;
};

const modifyHistory = async (history) => {
  const perGoldPointDollarPrice = await goldPointService.getGPDollarPrice(1);
  const updatedResults = [];
  await history.results.map(async (element, i) => {
    updatedResults[i] = {};
    updatedResults[i].message = element.message;
    updatedResults[i].user = element.user;
    updatedResults[i].txId = element.txId;
    updatedResults[i].status = element.status;
    updatedResults[i].gpBeforeTx = element.gpBeforeTx;
    updatedResults[i].gpAfterTx = element.gpAfterTx;
    updatedResults[i].dollarPricePerGP = perGoldPointDollarPrice;
    updatedResults[i].totalDollarPriceForGP = perGoldPointDollarPrice * element.goldPointAmount;
    updatedResults[i].coin = element.coin;
    updatedResults[i].price = element.price;
    updatedResults[i].toAddress = element.toAddress;
    updatedResults[i].coinAmount = element.coinAmount;
    updatedResults[i].bonusAmount = element.bonusAmount;
    updatedResults[i].totalCoinAmount = element.totalCoinAmount;
    updatedResults[i].goldPointAmount = element.goldPointAmount;
    updatedResults[i].unit = element.unit;
    updatedResults[i].id = element.id;
    updatedResults[i].email = element.email;
    updatedResults[i].createdAt = element.createdAt;
    updatedResults[i].updatedAt = element.updatedAt;
  });
  history.results = updatedResults;
  return history;
};

const createDateFormat = async (month, year) => {
  const startDate = `${year}-0${month}-01T18:00:00.000Z`;
  const endDate = `${year}-0${month}-31T18:00:00.000Z`;

  const queryDate = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  return queryDate;
};

const getAllHistoryForAdmin = async (filter, options) => {
  let history = await GPTxHistory.paginate(filter, options);
  if (!history) throw new ApiError(httpStatus.NOT_FOUND, 'No history found');

  history = await modifyHistory(history);

  history.total = {};
  history.total.totalExchangedGP = await getTotalExchangedGoldPoint();
  history.total.totalDollarPrice = await goldPointService.getGPDollarPrice(history.total.totalExchangedGP);

  return history;
};

const getSingleExchangeDetailsForAdmin = async (exchangeId) => {
  const details = await GPTxHistory.findOne({ _id: exchangeId });
  if (!details) throw new ApiError(httpStatus.NOT_FOUND, 'No Exchange details found for this exchange');

  const updatedDetails = await userService.bindUserInfo(details);

  return updatedDetails;
};

const getAllHistoryForUser = async (userId, options) => {
  const allHistory = await GPTxHistory.paginate({ user: userId }, options);

  if (!allHistory) throw new ApiError(httpStatus.NOT_FOUND, 'No history found for the user');

  return allHistory;
};

const getSingleExchangeDetailsForUser = async (userId, exchangeId) => {
  const details = await GPTxHistory.findOne({ _id: exchangeId });
  if (!details) throw new ApiError(httpStatus.NOT_FOUND, 'No Exchange details found for this exchange');

  if (String(details.user) !== String(userId))
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized to see this exchange details');

  const newDetails = { ...details };
  newDetails._doc.gpEquivalentDollarPrice = await goldPointService.getGPDollarPrice(details.goldPointAmount);

  return newDetails._doc;
};

module.exports = {
  create,
  exchange,
  updateExchangeRates,
  fetchExchangeRates,
  getExchangeEvaluationResult,
  getAllHistoryForAdmin,
  getAllHistoryForUser,
  getSingleExchangeDetailsForAdmin,
  getSingleExchangeDetailsForUser,
  totalCoinsExchanged,
  createDateFormat,
};

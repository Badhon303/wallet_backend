const httpStatus = require('http-status');
const exchangeService = require('./exchange.service');
const pick = require('../../../utils/pick');
const catchAsync = require('../../../utils/catchAsync');
const config = require('../../../config/config');

const createNew = catchAsync(async (req, res) => {
  const { coin, bonus, unit, status } = req.body;
  const args = {};
  args.coin = coin;
  if (bonus) args.bonus = bonus;
  if (unit) args.unit = unit;
  if (status) args.status = status;

  const response = await exchangeService.create(args);
  return res.status(httpStatus.CREATED).json({ message: `Coin exchange Rate created Successfully`, result: response });
});

const getExchangeRates = catchAsync(async (req, res) => {
  const { coin, status } = req.query;
  const filter = {};

  if (coin) filter.coin = coin;
  if (status) filter.status = status;
  const rates = await exchangeService.fetchExchangeRates(filter);

  return res.status(httpStatus.OK).json({ rates });
});

const updateExchange = catchAsync(async (req, res) => {
  const updatedRates = await exchangeService.updateExchangeRates(req.body);
  return res.status(httpStatus.OK).json(updatedRates);
});

const evaluateExchangeInpute = catchAsync(async (req, res) => {
  const { coin, unit } = req.query;
  const result = await exchangeService.getExchangeEvaluationResult(coin, unit);
  return res.status(httpStatus.OK).json(result);
});

const exchange = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const email = config.email.adminEmail;
  const {
    coin,
    unit,
    price,
    coinAmount,
    bonusAmount,
    totalCoinAmount,
    goldPointAmount,
    toAddress,
    transactionFee,
  } = req.body;
  const result = await exchangeService.exchange(userId, {
    coin,
    unit,
    email,
    price,
    toAddress,
    coinAmount,
    bonusAmount,
    totalCoinAmount,
    goldPointAmount,
    transactionFee,
  });

  res
    .status(httpStatus.CREATED)
    .json({ message: `${coin} purchased successfully using ${goldPointAmount} gold point`, result });
});

const getGPExchangeHistoryAdmin = catchAsync(async (req, res) => {
  const { role } = req.user;
  const filter = {};
  if (req.query.email) filter.email = req.query.email;
  if (req.query.coin) filter.coin = req.query.coin;
  if (req.query.month && req.query.year) {
    const dt = await exchangeService.createDateFormat(req.query.month, req.query.year);
    filter.createdAt = dt.createdAt;
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  let allHistory = null;
  if (role && role === 'admin') allHistory = await exchangeService.getAllHistoryForAdmin(filter, options);

  res.status(httpStatus.OK).json({ allHistory });
});

const getSingleExchangeDetailsForAdmin = catchAsync(async (req, res) => {
  const { exchangeId } = req.params;
  let exchangeDetails = null;

  if (req.user.role === 'admin') exchangeDetails = await exchangeService.getSingleExchangeDetailsForAdmin(exchangeId);

  res.status(httpStatus.OK).json({ exchangeDetails });
});

const getGPExchangeHistoryUser = catchAsync(async (req, res) => {
  const { role } = req.user;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const userId = req.user._id;
  let allHistory = null;
  if (role === 'user') allHistory = await exchangeService.getAllHistoryForUser(userId, options);
  // console.log(allHistory);
  res.status(httpStatus.OK).json({ allHistory });
});

const getSingleExchangeDetailsForUser = catchAsync(async (req, res) => {
  const { exchangeId } = req.params;
  let exchangeDetails = null;

  if (req.user.role === 'user')
    exchangeDetails = await exchangeService.getSingleExchangeDetailsForUser(req.user._id, exchangeId);

  res.status(httpStatus.OK).json({ exchangeDetails });
});

const getTotalCoinsExchanged = catchAsync(async (req, res) => {
  const { coin } = req.query;
  const total = await exchangeService.totalCoinsExchanged(coin);

  res.status(httpStatus.OK).json({ total });
});

module.exports = {
  exchange,
  createNew,
  updateExchange,
  getExchangeRates,
  evaluateExchangeInpute,
  getGPExchangeHistoryAdmin,
  getGPExchangeHistoryUser,
  getSingleExchangeDetailsForAdmin,
  getSingleExchangeDetailsForUser,
  getTotalCoinsExchanged,
};

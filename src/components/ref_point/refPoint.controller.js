const httpStatus = require('http-status');
const refPointservice = require('./refPoint.service');
// const { purchaseService } = require('../purchase');
const pick = require('../../utils/pick');
const catchAsync = require('../../utils/catchAsync');
const config = require('../../config/config');

const getReferralPoints = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const refPoints = await refPointservice.findByUser(userId);
  return res.status(httpStatus.OK).json(refPoints);
});

const getDollarPrice = catchAsync(async (req, res) => {
  const { amount } = req.query;
  // console.log(amount);
  const price = await refPointservice.findDollarPrice(amount);
  return res.status(httpStatus.OK).json({ price });
});

const updateUnitPrice = catchAsync(async (req, res) => {
  const { price } = req.body;
  const { role } = req.user;
  const response = await refPointservice.updateUnitPrice(price, role);
  return res.status(httpStatus.CREATED).json(response);
});

const exchangeRefPoint = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const email = config.email.adminEmail;
  const { refPoint, dollarPrice, currency, toAddress, amountOfCurrency, transactionFee } = req.body;

  const response = await refPointservice.exchangeWithRefPoint(userId, email, {
    refPoint,
    dollarPrice,
    currency,
    toAddress,
    amountOfCurrency,
    transactionFee,
  });
  res.status(httpStatus.OK).json(response);
});

const checkExchangeEligibility = catchAsync(async (req, res) => {
  const status = await refPointservice.checkRefPointEligibility(req.user._id);
  return res.status(httpStatus.OK).json(status);
});

const getTransactionDetailsByPurchaseId = catchAsync(async (req, res) => {
  const { purchaseId } = req.params;
  const userId = req.user._id;
  const { role } = req.user;
  const transactionDetail = await refPointservice.fetchTransactionDetailsById(userId, role, purchaseId);

  res.status(httpStatus.OK).json(transactionDetail);
});

const getOwnHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const txHistory = await refPointservice.fetchOwnTxHistory(userId, options);
  return res.status(httpStatus.OK).json(txHistory);
});

const getLatestTxHistory = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const latestTxHistories = await refPointservice.fetchLatestTxHistories(options);
  return res.status(httpStatus.OK).json(latestTxHistories);
});

const getRewardHistory = catchAsync(async (req, res) => {
  const currentUser = req.user;
  let refPointHistory = null;

  if (currentUser.role === 'admin') {
    const { orderId } = req.query;
    refPointHistory = await refPointservice.getRewardHistoryByOrderId(orderId);
  } else if (currentUser.role === 'user') {
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    refPointHistory = await refPointservice.getUsersRewardHistory(currentUser._id, options);
  }

  return res.status(httpStatus.OK).json(refPointHistory);
});

module.exports = {
  getReferralPoints,
  getDollarPrice,
  exchangeRefPoint,
  updateUnitPrice,
  checkExchangeEligibility,
  getTransactionDetailsByPurchaseId,
  getOwnHistory,
  getLatestTxHistory,
  getRewardHistory,
};

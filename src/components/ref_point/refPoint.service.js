const axios = require('axios');
const httpStatus = require('http-status');

const { userService } = require('../../services');
const { purchaseService } = require('../purchase');
const { StaticData } = require('../../models');

const RefPoint = require('./refPoint.model');
const RefTxHistory = require('./refPoint.txHistory.model');
const RefRewardHistory = require('./refpoint.rewardHistory.model');
const { User } = require('../../models');
const ApiError = require('../../utils/ApiError');
const config = require('../../config/config');
const { encryptIpAddress, encryptEmailAddress } = require('../../utils/crypto');

const create = async (userId) => {
  const user = await userService.getUserById(userId);
  const createrObj = await new RefPoint({ user }).save();
  if (!createrObj) throw new ApiError('Could not create referral object.');
  return createrObj;
};

const updateUnitPrice = async (price, role) => {
  if (role !== 'admin') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Only admin can update referral point price');
  }
  let staticData = await StaticData.find().exec();
  if (staticData.length === 0) {
    staticData = new StaticData({ refPointDollarPrice: price });
  } else staticData[0].refPointDollarPrice = price;

  const response = await staticData[0].save();
  return response;
};

const findDollarPrice = async (amount) => {
  const response = await StaticData.find().exec();
  const unitPrice = response[0].refPointDollarPrice;
  return unitPrice * amount;
};

const findByUser = async (userId) => {
  let refPoint = await RefPoint.findOne({ user: userId });
  if (!refPoint) {
    refPoint = await create(userId);
  }

  return refPoint;
};

const deleteByUser = async (userId) => {
  const result = await RefPoint.deleteOne({ user: userId });
  return result;
};

const addPoint = async (
  purchaser,
  receiver,
  purchasedAmount,
  receivedPercentage,
  receivedAmount,
  associatedTransaction,
  level
) => {
  if (!receiver || receivedAmount < 0.0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request cannot be handled.');
  }

  let refPoint = await RefPoint.findOne({ user: receiver });
  if (!refPoint) {
    refPoint = await create(receiver);
  }

  refPoint.totalPoint += receivedAmount;
  await refPoint.save();

  const refPointrewardhistory = new RefRewardHistory({
    purchaser,
    receiver,
    purchasedAmount,
    receivedPercentage,
    receivedAmount,
    associatedTransaction,
    level,
  });

  await refPointrewardhistory.save();
  return refPoint;
};

const deductPoint = async (user, amount) => {
  if (!user || amount < 0.0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request cannot be handled.');
  }

  const refPoint = await RefPoint.findOne({ user });
  if (!refPoint) throw new ApiError(httpStatus.NOT_FOUND, 'No referal point is attached to this user.');
  refPoint.totalPoint -= amount;
  await refPoint.save();

  return 'Amount deducted from referal point.';
};

const hasEnoughReferralPointToExchange = async (userId) => {
  const refPoint = await findByUser(userId);
  return refPoint.totalPoint >= 100;
};

const isEligibleToExchange = async (userId) => {
  const hasPurchased = await purchaseService.hasPurchased(userId);
  const hasEnoughPoints = await hasEnoughReferralPointToExchange(userId);
  const validUserStatus = await userService.hasValidApprovalStatus(userId);
  // const validUserStatus = await userService.hasValidApprovalStatus(userId, ['approved']);

  if (validUserStatus && hasEnoughPoints && hasPurchased) return true;
  return false;
};

const isAllowedToExchange = async (userId, refPoint) => {
  const refPointObj = await findByUser(userId);
  const response = { status: true };
  if (refPoint >= 100 && refPoint % 100 !== 0) {
    response.status = false;
    response.message = `Referral Point must be 100 or its multiples.`;
    return response;
  }
  if (refPoint > refPointObj.totalPoint) {
    response.status = false;
    response.message = `You don't have enough referral points.`;
  }
  return response;
};

const checkRefPointEligibility = async (userId) => {
  const hasPurchased = await purchaseService.hasPurchased(userId);
  const hasEnoughPoints = await hasEnoughReferralPointToExchange(userId);
  const isApproved = await userService.hasValidApprovalStatus(userId);

  return { hasPurchased, hasEnoughPoints, isApproved, isEligible: isApproved && hasEnoughPoints && hasPurchased };
};

const exchangeWithRefPoint = async (userId, email, args) => {
  const isEligible = await isEligibleToExchange(userId);
  if (!isEligible) throw new ApiError(httpStatus.FORBIDDEN, 'You are not eligible to exchange Referral Point');

  const isAllowed = await isAllowedToExchange(userId, args.refPoint);
  if (!isAllowed.status) throw new ApiError(httpStatus.NOT_ACCEPTABLE, isAllowed.message);

  const apiEndpoint = '/api/transfer';
  const url = config.blockchainApi.url + apiEndpoint;

  const options = {};
  //  options.from_type = 'admin';
  //  options.pkey = encryptPrivateKey(config.adminProps.reqKey);

  options.user = encryptEmailAddress(email);
  options.type = args.currency === 'WOLF' ? 'erc20' : 'coin';
  options.amount = Number(args.amountOfCurrency);
  options.currency = args.currency;
  options.to_address = args.toAddress;
  options.from_address = args.currency === 'BTC' ? config.admin.btcAddress : config.admin.ethAddress;
  options.transaction_fee = args.transactionFee;

  try {
    await deductPoint(userId, args.refPoint);
    const result = await axios.post(url, options, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });
    if (!result) {
      await addPoint(userId, args.refPoint);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not exchange Referral Point.');
    }
    const refTxObj = {
      user: userId,
      txId: result.data.result.txId,
      refPointUsed: args.refPoint,
      dollarPrice: args.dollarPrice,
      currency: args.currency,
      toAddress: args.toAddress,
      purchasedCurrencyAmount: args.amountOfCurrency,
      status: result.data.status_code === 200,
    };
    RefTxHistory.create(refTxObj);
    return result.data.result;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const fetchTransactionDetailsById = async (userId, role, purchaseId) => {
  const purchaseDetails = await RefTxHistory.findById(purchaseId);
  if (!purchaseDetails) throw new ApiError(httpStatus.NOT_FOUND, 'No purchase details found with the purchase Id');
  if (String(userId) !== String(purchaseDetails.user) && role !== 'admin')
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized to view the details of this purchase');
  return purchaseDetails;
};

const fetchOwnTxHistory = async (userId, options) => {
  const user = await userService.getUserById(userId);
  const allTx = await RefTxHistory.paginate({ user: user.id }, options);
  if (!allTx) throw new ApiError(httpStatus.NOT_FOUND, 'No Transactions Found for the requested user');
  return allTx;
};

const fetchLatestTxHistories = async (options) => {
  const filter = {};
  const latestTxHistories = await RefTxHistory.paginate(filter, options);
  if (!latestTxHistories) throw new ApiError(httpStatus.NOT_FOUND, 'No Transactions Found');

  for (let i = 0; i < latestTxHistories.results.length; i += 1) {
    const user = await User.findById(latestTxHistories.results[i].user).select(
      'firstName middleName lastName nickName email'
    );
    latestTxHistories.results[i].user = user;
  }

  return latestTxHistories;
};

const getRewardHistoryByOrderId = async (orderId) => {
  if (!orderId) throw new ApiError(httpStatus.BAD_REQUEST, 'orderId is required');

  const history = await RefRewardHistory.find({ associatedTransaction: orderId });
  const rewardHistory = [];

  for (let index = 0; index < history.length; index += 1) {
    const receiver = await userService.getUserById(history[index].receiver);
    const historyobj = {
      fullName:
        (receiver.lastName ? `${receiver.lastName} ` : '') +
        (receiver.firstName ? `${receiver.firstName} ` : '') +
        (receiver.middleName ? `${receiver.middleName} ` : '') +
        receiver.nickName,
      email: receiver.email,
      rewardedPoint: history[index].receivedAmount,
      rewardRatio: history[index].receivedPercentage,
      level: history[index].level ? history[index].level : index + 1,
    };

    rewardHistory.push(historyobj);
  }

  return Promise.all(rewardHistory);
};

const getUsersRewardHistory = async (userId, options) => {
  let rewardHistory = [];
  const history = await RefRewardHistory.paginate({ receiver: userId }, options);

  if (history.results && history.results.length > 0) {
    rewardHistory = await Promise.all(
      history.results.map(async (item) => {
        const referrer = await userService.getUserById(item.purchaser);
        const historyObj = {};
        historyObj.email = referrer.email;
        historyObj.nickName = referrer.nickName;
        historyObj.time = item.createdAt;
        historyObj.rewardedPoint = item.receivedAmount;
        return historyObj;
      })
    );
    history.results = rewardHistory;
    return history;
  }
  return history;
};

module.exports = {
  addPoint,
  findByUser,
  deductPoint,
  deleteByUser,
  findDollarPrice,
  updateUnitPrice,
  isEligibleToExchange,
  exchangeWithRefPoint,
  checkRefPointEligibility,
  fetchTransactionDetailsById,
  fetchOwnTxHistory,
  fetchLatestTxHistories,
  getRewardHistoryByOrderId,
  getUsersRewardHistory,
};

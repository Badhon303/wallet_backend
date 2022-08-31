/* eslint-disable prefer-destructuring */
const axios = require('axios');
const httpStatus = require('http-status');

const { userService } = require('../../services');
const { StaticData } = require('../../models');

const GoldPoint = require('./goldPoint.model');
const GPExecHistory = require('./goldPoint.triggerExecHistory.model');
const GoldPointTrigger = require('./goldPoint.trigger.model');
const GoldPointTriggerSingle = require('./goldPoint.trigger.single.model');

const config = require('../../config/config');
const ApiError = require('../../utils/ApiError');

const create = async (userId) => {
  const user = await userService.getUserById(userId);
  const gpObj = new GoldPoint({ user });
  const response = await gpObj.save();
  return response;
};

const fetchTotalGP = async () => {
  const total = await GoldPoint.aggregate([{ $group: { _id: 'totalPoint', TotalGoldPoint: { $sum: '$totalPoint' } } }]);
  return total[0].TotalGoldPoint;
};

const getGPDollarPrice = async (goldPointAmount) => {
  const price = await StaticData.find().exec();
  if (!price) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not fetch gold point dollar price');
  }
  const goldPointPrice = price[0].goldPointDollarPrice * goldPointAmount;
  return goldPointPrice;
};

const getGoldPointByUserId = async (userId) => {
  if (!userId) throw new ApiError(httpStatus.NOT_FOUND, `Please login first`);

  const gp = await GoldPoint.findOne({ user: userId });
  if (!gp) {
    const response = await create(userId);
    return response.totalPoint;
  }
  return gp.totalPoint;
};

const updateGPDollarPrice = async () => {
  const { url, key } = config.goldPriceApi;

  const order = await axios.get(`${url}?access_key=${key}&base=XAU&symbols=USD`);

  if (!order) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not fetch gold dollar price');
  }

  let response = null;
  let staticData = await StaticData.find().exec();

  if (!staticData || staticData.length === 0) {
    staticData = new StaticData();
    staticData.goldPointDollarPrice = order.data.rates.USD;
    response = await staticData.save();
  } else if (staticData && staticData.length > 0) {
    staticData[0].goldPointDollarPrice = order.data.rates.USD;
    response = await staticData[0].save();
  }

  if (!response) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not update gold dollar price');
  }
};

const getGpAmountByDollarPrice = async (dollarPrice) => {
  if (dollarPrice === 0) throw new ApiError(httpStatus.BAD_REQUEST, `Price cannot be zero`);
  const goldPointPrice = await StaticData.findOne({}, 'goldPointDollarPrice');

  return dollarPrice / goldPointPrice.goldPointDollarPrice;
};

const deductGoldPoint = async (userId, amount) => {
  if (!userId || amount < 0.0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request cannot be handled.');
  }

  const goldPoint = await GoldPoint.findOne({ user: userId });
  if (!goldPoint) throw new ApiError(httpStatus.NOT_FOUND, 'No gold point is attached to this user.');
  const gpBeforeTx = goldPoint.totalPoint;
  goldPoint.totalPoint -= amount;
  const gpAfterTx = goldPoint.totalPoint;
  await goldPoint.save();
  return {
    message: 'Amount deducted from gold point.',
    gpBeforeTx,
    gpAfterTx,
  };
};

const addGoldPoint = async (userId, amount) => {
  if (!userId || amount < 0.0) throw new ApiError(httpStatus.BAD_REQUEST, 'Request cannot be handled.');
  let goldPoint = await GoldPoint.findOne({ user: userId });

  if (!goldPoint) goldPoint = await create(userId);
  goldPoint.totalPoint += amount;

  await goldPoint.save();
};

const triggerGPForSingleUser = async (email, goldPoint) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user email does not exist');
  }
  let gpObj = await GoldPoint.findOne({ user: user._id });
  goldPoint = Number(goldPoint);

  let goldPointBeforeTrigger = 0;
  let receivedGoldPointAmount = 0;
  let goldPointAfterTrigger = 0;
  let trigger = null;

  if (!gpObj) {
    await create(user._id);

    if (goldPoint < 0) goldPoint = 0;
    goldPointBeforeTrigger = 0;
    receivedGoldPointAmount = goldPoint;
    goldPointAfterTrigger = receivedGoldPointAmount;

    const updateGPStatus = await GoldPoint.updateOne({ user: user._id }, { $set: { totalPoint: receivedGoldPointAmount } });

    if (!updateGPStatus) throw new ApiError(httpStatus.BAD_REQUEST, 'trigger failed');
  } else {
    goldPointBeforeTrigger = gpObj.totalPoint;
    receivedGoldPointAmount = goldPoint;
    goldPointAfterTrigger = goldPointBeforeTrigger + receivedGoldPointAmount;

    if (goldPointAfterTrigger < 0) {
      goldPointAfterTrigger = 0;
      receivedGoldPointAmount = Math.abs(goldPointBeforeTrigger + receivedGoldPointAmount) + receivedGoldPointAmount;
    }
    gpObj.totalPoint = goldPointAfterTrigger;
    gpObj = await gpObj.save();
  }

  trigger = await GoldPointTriggerSingle.create({
    totalGoldPoint: receivedGoldPointAmount,
    status: 'success',
    userEmail: email,
  });

  await GPExecHistory.create({
    user: user._id,
    trigger: trigger._id,
    goldPointBeforeTrigger,
    receivedGoldPointAmount,
    goldPointAfterTrigger,
  });
  return gpObj;
};

// Get all trigger history for all users
const getTriggerHistoryAll = async (filter, options) => {
  const allTriggers = await GoldPointTrigger.paginate(filter, options);
  const results = [];
  allTriggers.results.forEach((trigger) => {
    const triggerObj = {
      id: trigger._id,
      token: trigger.token,
      executionDate: `${trigger.day}/${trigger.month}/${trigger.year} ${trigger.hour}:${trigger.minute}`,
      gpPerToken: trigger.gpPerToken,
      totalGP: trigger.totalGP,
      numberOfUsers: trigger.numberOfUsers,
      status: trigger.status,
    };
    results.push(triggerObj);
  });
  allTriggers.results = results;
  return allTriggers;
};

// Get single trigger history execution detail from all users trigger history
const fetchSingleTriggerHistory = async (triggerId, options) => {
  let trigger = await GPExecHistory.paginate({ trigger: triggerId }, options);
  trigger = await userService.getUserDetails(trigger.results);
  if (trigger.length <= 0) throw new ApiError(httpStatus.NOT_FOUND, 'Trigger does not exist');
  return trigger;
};

const appendDollarPrice = async (histories) => {
  for (let i = 0; i < histories.results.length; i += 1) {
    histories.results[i].equivalentDollarPrice = await getGPDollarPrice(histories.results[i].totalGoldPoint);
  }
  return histories;
};

// Get all trigger history for single users
const fetchTriggerHistorySingle = async (filter, options) => {
  const allTriggers = await GoldPointTriggerSingle.paginate(filter, options);
  if (allTriggers.results.length <= 0) throw new ApiError(httpStatus.NOT_FOUND, 'No trigger history exists');

  const updatedTriggers = await userService.getUserDetailsForSingleUser(allTriggers);
  await appendDollarPrice(updatedTriggers);
  return updatedTriggers;
};

// Get single trigger history execution details from single user's trigger history
const fetchOneTriggerHistory = async (triggerId, options, userId, role) => {
  let trigger = await GPExecHistory.paginate({ trigger: triggerId, user: userId }, options);
  trigger = await userService.getUserDetails(trigger.results);
  if (trigger.length <= 0) throw new ApiError(httpStatus.NOT_FOUND, 'Trigger does not exist');
  delete trigger[0].id;

  if (String(userId) !== String(trigger[0].user.id) && role !== 'admin')
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized to see this record');

  trigger[0].gpEquivalentDollarPrice = await getGPDollarPrice(trigger[0].receivedGoldPointAmount);
  return trigger;
};

const fetchOwnAllTriggerHistory = async (filter, options) => {
  const allTriggers = await GPExecHistory.paginate(filter, options);
  if (allTriggers.results.length <= 0) throw new ApiError(httpStatus.NOT_FOUND, 'No trigger history exists');

  const newResults = [];
  allTriggers.results.forEach((el) => {
    const obj = {
      _id: el.trigger,
      totalGoldPoint: el.receivedGoldPointAmount,
      createdAt: el.createdAt,
    };
    newResults.push(obj);
  });
  allTriggers.results = newResults;

  return allTriggers;
};

const deleteGPAcc = async (userId) => {
  const response = await GoldPoint.deleteOne({ user: userId });
  return response;
};

module.exports = {
  create,
  fetchTotalGP,
  addGoldPoint,
  deductGoldPoint,
  getGPDollarPrice,
  updateGPDollarPrice,
  getTriggerHistoryAll,
  getGoldPointByUserId,
  triggerGPForSingleUser,
  fetchOneTriggerHistory,
  getGpAmountByDollarPrice,
  fetchSingleTriggerHistory,
  fetchTriggerHistorySingle,
  fetchOwnAllTriggerHistory,
  deleteGPAcc,
};

const httpStatus = require('http-status');

const triggerService = require('./trigger.service');
const goldPointService = require('./goldPoint.service');
const pick = require('../../utils/pick');
const catchAsync = require('../../utils/catchAsync');

const getGoldPoints = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const goldPoints = await goldPointService.getGoldPointByUserId(userId);
  return res.status(httpStatus.OK).json({ goldPoints });
});

const fetchTotalGoldPoints = catchAsync(async (req, res) => {
  let totalGP = 0;
  if (req.user.role === 'admin') {
    totalGP = await goldPointService.fetchTotalGP();
  }
  return res.status(httpStatus.OK).json({ totalGP });
});

const getGoldPointDollarPrice = catchAsync(async (req, res) => {
  const { goldPointAmount } = req.query;
  const price = await goldPointService.getGPDollarPrice(goldPointAmount);
  return res.status(httpStatus.OK).json({ price });
});

const triggerGoldPoint = catchAsync(async (req, res) => {
  let triggerResult = null;
  if (req.body.type === 'single') {
    const { email, goldPoint } = req.body;
    triggerResult = await goldPointService.triggerGPForSingleUser(email, goldPoint);
  } else {
    const { token, scheduleDate, goldPoint } = req.body;
    console.log(`Schedule date is: ${scheduleDate}`);
    triggerResult = await triggerService.createTrigger(token, scheduleDate, goldPoint);
  }

  return res.status(httpStatus.OK).json({ message: `Trigger created successfully`, trigger: triggerResult });
});

// 1. Get all trigger history for all users
const fetchTriggerHistoryAll = catchAsync(async (req, res) => {
  const filter = {};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const allTriggers = await goldPointService.getTriggerHistoryAll(filter, options);

  res.send(allTriggers);
});

// 2.Get single trigger history execution detail from all users trigger history
const fetchSingleTriggerHistory = catchAsync(async (req, res) => {
  const { triggerId } = req.params;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const trigger = await goldPointService.fetchSingleTriggerHistory(triggerId, options);
  res.status(httpStatus.OK).json({ trigger });
});

// 3. Get all trigger history for single users
const fetchTriggerHistorySingle = catchAsync(async (req, res) => {
  const filter = {};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const allTriggers = await goldPointService.fetchTriggerHistorySingle(filter, options);

  res.send(allTriggers);
});

// 4. Get single trigger history execution details from single user's trigger history
const fetchOneTriggerHistory = catchAsync(async (req, res) => {
  const { triggerId } = req.params;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const userId = req.user._id;
  const { role } = req.user;
  const trigger = await goldPointService.fetchOneTriggerHistory(triggerId, options, userId, role);
  res.status(httpStatus.OK).json({ trigger });
});

// Fetch own all trigger history for a single user
const fetchOwnAllTriggerHistory = catchAsync(async (req, res) => {
  const filter = {};
  const user = req.user._id;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  filter.user = user;
  const allTrigger = await goldPointService.fetchOwnAllTriggerHistory(filter, options);
  res.status(httpStatus.OK).json({ allTrigger });
});

const deleteTrigger = catchAsync(async (req, res) => {
  const { triggerId } = req.params;
  const response = await triggerService.deleteTriggerById(triggerId);
  res.status(httpStatus.OK).json(response);
});

module.exports = {
  getGoldPoints,
  triggerGoldPoint,
  getGoldPointDollarPrice,
  fetchTriggerHistoryAll,
  fetchSingleTriggerHistory,
  fetchTriggerHistorySingle,
  fetchOneTriggerHistory,
  deleteTrigger,
  fetchTotalGoldPoints,
  fetchOwnAllTriggerHistory,
};

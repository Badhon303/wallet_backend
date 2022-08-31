const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const mlmService = require('./mlm.service');

const addByEmail = catchAsync(async (req, res) => {
  const { userEmail, parentEmail } = req.body;
  const response = await mlmService.addByEmail(userEmail, parentEmail);
  return res.status(httpStatus.CREATED).send(response);
});

const addById = catchAsync(async (req, res) => {
  const { parentId } = req.body;
  const { userId } = req.params;
  const response = await mlmService.addById(userId, parentId);
  return res.status(httpStatus.CREATED).send(response);
});

const getReferrer = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const referrer = await mlmService.getReferrer(userId);
  res.status(httpStatus.OK).json(referrer);
});

const updateReferrer = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { referrerEmail } = req.body;
  const response = await mlmService.updateReferrer(userId, referrerEmail);
  return res.status(httpStatus.OK).json(response);
});

const viewMlmTree = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { role } = req.user;
  const { email } = req.query;
  const mlmObj = await mlmService.getMlmTree(userId, role, email);
  return res.status(httpStatus.OK).json(mlmObj);
});

const updateMlmTree = catchAsync(async (req, res) => {
  const { role } = req.user;
  const { email } = req.body;
  const userId = req.user._id;

  let response = null;

  if (email && role === 'admin') response = await mlmService.updateMlmTreeByEmail(email);
  else response = await mlmService.updateMlmTree(userId, role);
  return res.status(httpStatus.OK).json(response);
});

const reward = catchAsync(async (req, res) => {
  const { userId, packagePrice } = req.params;
  const { orderId } = req.body;
  const response = await mlmService.handleReferralPoint(userId, orderId, packagePrice);
  res.status(httpStatus.OK).json(response);
});

module.exports = {
  reward,
  addById,
  addByEmail,
  getReferrer,
  viewMlmTree,
  updateReferrer,
  updateMlmTree,
};

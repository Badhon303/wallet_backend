// const httpStatus = require('http-status');
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ethAccService = require('./eth-account.service');

// const create = catchAsync(async (req, res) => {
//   const userId = req.user._id;
//   const createdAccount = await ethAccService.create(userId);
//   return res.status(httpStatus.CREATED).json(createdAccount);
// });

const getTokenBalance = catchAsync(async (req, res) => {
  const { address, currency, type } = req.query;

  const fetchedBalance = await ethAccService.getBalance(address, currency, type);
  res.send(fetchedBalance);
});

// Hot Wallet Transfer function started
// const transferToken = catchAsync(async (req, res) => {
//   const { currency, type, from_address, user, to_address, amount, transaction_fee } = req.body;
//   let { pkey } = req.body;

//   if (!pkey) pkey = config.adminProps.reqKey;

//   const sendToken = await ethAccService.sendToken(currency, type, from_address, user, to_address, amount, transaction_fee);

//   res.send(sendToken);
// });
// Hot Wallet transfer function ended

const transferToken = catchAsync(async (req, res) => {
  const { role, email } = req.user;

  if (email !== req.body.user)
    throw new ApiError(httpStatus.CONFLICT, `Email address does not match with one in authorization key.`);
  const sendToken = await ethAccService.sendToken(role, req.body);

  res.send(sendToken);
});

const calculateTxFee = catchAsync(async (req, res) => {
  // const { pkey } = req.body;

  // if (!pkey) req.body.pkey = config.adminProps.reqKey;
  // if (role === 'admin')
  // const { role } = req.user;

  const calculatedTxFee = await ethAccService.calculateTxFee(req.body);

  res.send(calculatedTxFee);
});

module.exports = {
  // create,
  getTokenBalance,
  transferToken,
  calculateTxFee,
};

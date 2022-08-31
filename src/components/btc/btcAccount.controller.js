const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');

const btcAccService = require('./btcAccount.service');

// const createBtcAcc = catchAsync(async (req, res) => {
//   const userId = req.user._id;
//   const btcAcc = await btcAccService.create(userId);
//   res.status(httpStatus.OK).json(btcAcc);
// });

const getBtcAccounts = async (req, res) => {
  const userId = req.user._id;
  const registerdAccounds = await btcAccService.getBtcAccountsByUserId(userId);
  return res.status(httpStatus.OK).json(registerdAccounds);
};

const getBalanceByAccId = catchAsync(async (req, res) => {
  const { address } = req.query;
  const balance = btcAccService.findAccBalanceByAddress(address);
  return res.status(httpStatus.OK).json({ balance });
});

const transfer = catchAsync(async (req, res) => {
  const { id, sendersAddress } = req.query;
  const { amount, recipientsAddress } = req.body;
  const response = btcAccService.transfer(id, sendersAddress, recipientsAddress, amount);
  res.status(httpStatus.OK).json(response);
});

module.exports = {
  // createBtcAcc,
  getBtcAccounts,
  getBalanceByAccId,
  transfer,
};

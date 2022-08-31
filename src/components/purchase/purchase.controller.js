const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const purchaseService = require('./purchase.service');
const pick = require('../../utils/pick');
// const Purchase = require('./purchase.model');

const getPackageList = catchAsync(async (req, res) => {
  const packageList = await purchaseService.getPackageList();
  return res.status(httpStatus.OK).json(packageList);
});

const cartCalculation = catchAsync(async (req, res) => {
  const bodyData = req.body;
  const calculationResult = await purchaseService.getCalculationResult(bodyData);
  return res.send(calculationResult);
});

const submitCart = catchAsync(async (req, res) => {
  const bodyData = req.body;
  const userId = req.user._id;
  const submissionResult = await purchaseService.submitCart(userId, bodyData);
  return res.send(submissionResult);
});

const getOrders = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const orders = await purchaseService.getOrdersByUserId(userId, options);
  const finalResponse = await purchaseService.constructResponseWithPagination(orders, userId, options);
  return res.status(httpStatus.OK).json(finalResponse);
});

const getOrderDetailsById = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const orrderDetails = await purchaseService.getOrderDetailsById(orderId);
  return res.send(orrderDetails);
});

const getPurchaseHistory = catchAsync(async (req, res) => {
  const filter = {};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const allOrders = await purchaseService.getPurchaseHistory(filter, options);

  const mergedUserObject = await purchaseService.mergeUserObject(allOrders);
  const finalResponse = await purchaseService.mergeStatusAndTime(mergedUserObject);
  res.send(finalResponse);
});

module.exports = {
  getPackageList,
  cartCalculation,
  submitCart,
  getOrders,
  getOrderDetailsById,
  getPurchaseHistory,
};

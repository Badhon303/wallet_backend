const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const purchaseController = require('./purchase.controller');
const purchaseValidations = require('./purchase.validations');

const { matchOTP } = require('../../utils/otp');

const router = express.Router();

router.route('/').get(auth('getpackages'), purchaseController.getPackageList);

router
  .route('/cart/calculate')
  .post(auth('cartOperations'), validate(purchaseValidations.cartCalculation), purchaseController.cartCalculation);

router
  .route('/cart/submit')
  .post(auth('cartOperations'), validate(purchaseValidations.cartSubmit), matchOTP, purchaseController.submitCart);

router.route('/orders').get(auth('getOrders'), validate(purchaseValidations.getOrders), purchaseController.getOrders);

router
  .route('/purchaseHistory')
  .get(auth('getPurchaseHistory'), validate(purchaseValidations.getPurchaseHistory), purchaseController.getPurchaseHistory);

router
  .route('/orders/:orderId')
  .get(auth('getOrder'), validate(purchaseValidations.getOrderDetailsById), purchaseController.getOrderDetailsById);

module.exports = router;

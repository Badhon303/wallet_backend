const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const refPointValidations = require('./refPoint.validations');
const refPointController = require('./refPoint.controller');

const { matchOTP } = require('../../utils/otp');

const router = express.Router();

router.route('/').get(auth('getReferralPoints'), refPointController.getReferralPoints);

router
  .route('/dollar-price')
  .get(validate(refPointValidations.dollarPrice), refPointController.getDollarPrice)
  .put(
    auth('updateReferralPointPrice'),
    validate(refPointValidations.updateReferralPointPrice),
    refPointController.updateUnitPrice
  );

router
  .route('/reward-history')
  .get(auth('getRewardHistory'), validate(refPointValidations.getRewardHistory), refPointController.getRewardHistory);

router
  .route('/exchange')
  .post(auth('exchangeRefPoint'), validate(refPointValidations.exchange), matchOTP, refPointController.exchangeRefPoint);

router.route('/exchange/check-status').get(auth('exchangeRefPoint'), refPointController.checkExchangeEligibility);

router.route('/exchange/own-history').get(auth('getOwnTransactions'), refPointController.getOwnHistory);

router.route('/exchange/latest-tx-history').get(auth('getLatestTransactions'), refPointController.getLatestTxHistory);

router
  .route('/exchange/:purchaseId')
  .get(auth('getPurchaseDetailsById'), refPointController.getTransactionDetailsByPurchaseId);

module.exports = router;

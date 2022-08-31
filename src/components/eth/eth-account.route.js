const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const ethAccValidation = require('./eth-account.validations');
const ethAccController = require('./eth-account.controller');

const { matchOTP } = require('../../utils/otp');

const router = express.Router();

// router.route('/').post(auth('createEthAccount'), ethAccController.create);

router
  .route('/get-balance')
  .get(auth('getBalance'), validate(ethAccValidation.getBalance), ethAccController.getTokenBalance);

router
  .route('/calculate-tx-fee')
  .post(auth('calculateTxFee'), validate(ethAccValidation.calculateTxFee), ethAccController.calculateTxFee);

router
  .route('/transfer')
  .post(auth('performTransaction'), validate(ethAccValidation.transferToken), matchOTP, ethAccController.transferToken);

module.exports = router;

const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const exchangeValidation = require('./exchange.validation');
const exchangeController = require('./exchange.controller');

const { matchOTP } = require('../../../utils/otp');

const router = express.Router();

router
  .route('/')
  .post(auth('exchangeGoldPoint'), validate(exchangeValidation.exchange), matchOTP, exchangeController.exchange);

router
  .route('/evaluation')
  .get(
    auth('evaluateExchangeInput'),
    validate(exchangeValidation.evaluateExchangeInpute),
    exchangeController.evaluateExchangeInpute
  );

router
  .route('/exchange-rates')
  .get(auth('getExchangeRates'), validate(exchangeValidation.getExchangeRates), exchangeController.getExchangeRates)
  .post(auth('createNewExchangeRate'), validate(exchangeValidation.createNewExchangeRate), exchangeController.createNew)
  .put(auth('updateExchangeRates'), validate(exchangeValidation.updateExchangeRates), exchangeController.updateExchange);

router
  .route('/histories')
  .get(
    auth('getExchangeHistories'),
    validate(exchangeValidation.exchangeHistoryValidation),
    exchangeController.getGPExchangeHistoryAdmin
  );

router
  .route('/histories/users/')
  .get(
    auth('getUserExchangeHistories'),
    validate(exchangeValidation.exchangeHistoryValidation),
    exchangeController.getGPExchangeHistoryUser
  );

router
  .route('/histories/:exchangeId')
  .get(
    auth('getExchangeHistory'),
    validate(exchangeValidation.getSingleExchangeDetails),
    exchangeController.getSingleExchangeDetailsForAdmin
  );

router
  .route('/histories/users/:exchangeId')
  .get(
    auth('getUserExchangeHistory'),
    validate(exchangeValidation.getSingleExchangeDetails),
    exchangeController.getSingleExchangeDetailsForUser
  );

router
  .route('/total-exchanged')
  .get(
    auth('getTotalCoinExchanged'),
    validate(exchangeValidation.calculateTotalExchanged),
    exchangeController.getTotalCoinsExchanged
  );
module.exports = router;

// production privileges
// admin - 46
// user - 30

// Development database privileges
// admin - 48
// user - 30

const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const tokenValidations = require('./token.validations');
const tokenController = require('./token.controller');

const router = express.Router();

router.route('/').get(auth('getTokenInfo'), validate(tokenValidations.getTokenInfo), tokenController.getTokenInfo);

router.route('/:tokenName').put(auth('updateTokenInfo'), validate(tokenValidations.update), tokenController.update);

router.route('/price').get(auth('getTokenPrice'), validate(tokenValidations.getTokenPrice), tokenController.getTokenPrice);

router
  .route('/amount')
  .get(auth('getTokenAmount'), validate(tokenValidations.getTokenAmount), tokenController.getTokenAmountByPrice);
module.exports = router;

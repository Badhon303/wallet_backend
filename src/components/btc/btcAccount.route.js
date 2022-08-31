const express = require('express');
const auth = require('../../middlewares/auth');
// const validate = require('../../middlewares/validate');

const btcAccController = require('./btcAccount.controller');
// const btcAccValidations = require('./btcAccount.validations');

const router = express.Router();

router.route('/account').get(auth('btcAccount'), btcAccController.getBtcAccounts);
// .post(auth('btcAccount'), btcAccController.createBtcAcc);

module.exports = router;

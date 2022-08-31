const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const mlmController = require('./mlm.controller');
const mlmValidations = require('./mlm.validation');

const router = express.Router();

router.route('/').post(validate(mlmValidations.addByEmail), mlmController.addByEmail);

router
  .route('/tree')
  .get(auth('getMlmTree'), validate(mlmValidations.getMlmTree), mlmController.viewMlmTree)
  .post(auth('updateMlmTree'), validate(mlmValidations.updateMlmTree), mlmController.updateMlmTree);

router.route('/:userId').post(validate(mlmValidations.addById), mlmController.addById);
router
  .route('/:userId/referrer')
  .get(auth('getReferrer'), validate(mlmValidations.getReferrer), mlmController.getReferrer)
  .put(auth('updateReferrer'), validate(mlmValidations.updateReferrer), mlmController.updateReferrer);

router
  .route('/:userId/reward/:packagePrice')
  .post(auth('distributeReferralPoints'), validate(mlmValidations.reward), mlmController.reward);

module.exports = router;

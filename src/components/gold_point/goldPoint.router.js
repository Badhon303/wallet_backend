const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const goldPointValidation = require('./goldPoint.validation');
const goldPointController = require('./goldPoint.controller');
const { exchangeRoute } = require('./exchange');

const router = express.Router();

router.route('/').get(auth('getGoldPoints'), goldPointController.getGoldPoints);

router.use('/exchange', exchangeRoute);

router
  .route('/dollar-price')
  .get(
    auth('getGoldPointDollarPrice'),
    validate(goldPointValidation.getDollarPrice),
    goldPointController.getGoldPointDollarPrice
  );

router.route('/total-gp').get(auth('getTotalGoldPoint'), goldPointController.fetchTotalGoldPoints);

router
  .route('/trigger')
  .post(auth('triggerGoldPoint'), validate(goldPointValidation.triggerGoldPoint), goldPointController.triggerGoldPoint);

router
  .route('/trigger/history-all')
  .get(
    auth('getAllTriggerHistory'),
    validate(goldPointValidation.getTriggerHistoryAll),
    goldPointController.fetchTriggerHistoryAll
  );

router
  .route('/trigger/fetch-trigger/:triggerId')
  .get(auth('getTriggerDetails'), validate(goldPointValidation.fetchTrigger), goldPointController.fetchSingleTriggerHistory);

router
  .route('/trigger/history-single')
  .get(
    auth('getOwnAllTriggerHistory'),
    validate(goldPointValidation.getTriggerHistoryAll),
    goldPointController.fetchTriggerHistorySingle
  );
router
  .route('/trigger/own-history-single')
  .get(
    auth('getAllTriggerSharedByAdmin'),
    validate(goldPointValidation.fetchOwnAllTriggerHistory),
    goldPointController.fetchOwnAllTriggerHistory
  );

router
  .route('/trigger/fetch-trigger-single/:triggerId')
  .get(auth('getOwnTriggerDetails'), validate(goldPointValidation.fetchTrigger), goldPointController.fetchOneTriggerHistory);

router
  .route('/trigger/:triggerId')
  .delete(auth('deleteTrigger'), validate(goldPointValidation.deleteTrigger), goldPointController.deleteTrigger);

module.exports = router;

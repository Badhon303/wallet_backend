const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const termsConditionsController = require('./termsConditions.controller');
const termsConditionsValidation = require('./termsConditions.validation');

const router = express.Router();

router
  .route('/')
  .get(termsConditionsController.getTermsConditions)
  .post(
    auth('createTermsAndConditions'),
    validate(termsConditionsValidation.createTermsAndConditions),
    termsConditionsController.create
  );

router
  .route('/sections')
  .post(
    auth('updateSections'),
    validate(termsConditionsValidation.updateSections),
    termsConditionsController.updateSections
  );

router
  .route('/conditions')
  .post(
    auth('modifyConditions'),
    validate(termsConditionsValidation.addNewConditions),
    termsConditionsController.addnewConditions
  )
  .delete(
    auth('modifyConditions'),
    validate(termsConditionsValidation.removeConditions),
    termsConditionsController.removeConditions
  );

module.exports = router;

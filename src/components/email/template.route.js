const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const templateController = require('./template.controller');
const templateValidations = require('./template.validation');

const router = express.Router();

router
  .route('/')
  .get(auth(`getAllEmailTemplates`), templateController.getAll)
  .post(auth('createNewEmailTemplate'), validate(templateValidations.createNewEmailTemplate), templateController.create);

router
  .route('/:templateId')
  .get(validate(templateValidations.getById), templateController.getById)
  .put(auth('updateEmailtemplate'), validate(templateValidations.updateEmailtemplate), templateController.update)
  .delete(auth('deleteEmailTemplate'), validate(templateValidations.deleteEmailTemplate), templateController.remove);

module.exports = router;

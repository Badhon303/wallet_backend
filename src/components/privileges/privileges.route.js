const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const privilegeController = require('./privileges.controller');
const privilegeValidations = require('./privileges.validations');

const router = express.Router();

router
  .route('/')
  .get(auth('getAllPrivileges'), privilegeController.getAllPrivileges)
  .post(auth('addNewPrivilege'), validate(privilegeValidations.addNewPrivilege), privilegeController.addNewPrivilege);

module.exports = router;

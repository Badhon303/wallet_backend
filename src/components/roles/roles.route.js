const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const rolesController = require('./roles.controller');
const rolesValidations = require('./roles.validation');

const router = express.Router();

router
  .route('/')
  .get(auth('getAllRoles'), rolesController.getAll)
  .post(auth('createNewRole'), validate(rolesValidations.createNewRole), rolesController.createNewRole);

router
  .route('/:roleId')
  .get(auth('getRole'), validate(rolesValidations.getRole), rolesController.getRole)
  .put(auth('UpdateRole'), validate(rolesValidations.updateRole), rolesController.updateRole)
  .delete(auth('deleteRole'), validate(rolesValidations.deleteRole), rolesController.deleteRole);

router
  .route('/:roleId/privileges')
  .get(auth('getRolePrivileges'), validate(rolesValidations.getRolePrivileges), rolesController.getRolePrivileges)
  .put(auth('addRolePrivilege'), validate(rolesValidations.addRolePrivilege), rolesController.addRolePrivilege);

router
  .route('/:roleId/privileges/:privilegeId')
  .delete(
    auth('deleteRolePrivileges'),
    validate(rolesValidations.deleteRolePrivileges),
    rolesController.deleteRolePrivileges
  );

module.exports = router;

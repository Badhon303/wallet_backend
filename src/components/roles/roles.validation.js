const Joi = require('joi');
const { objectId } = require('../../validations/custom.validation');

const createNewRole = {
  body: Joi.object().keys({
    role: Joi.string().required(),
    priviliges: Joi.array().items(Joi.string().custom(objectId)),
  }),
};

const getRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const updateRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    role: Joi.string().required(),
  }),
};

const deleteRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const getRolePrivileges = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
  }),
};

const addRolePrivilege = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    privilegeId: Joi.string().custom(objectId).required(),
  }),
};

const deleteRolePrivileges = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
    privilegeId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createNewRole,
  getRole,
  updateRole,
  deleteRole,
  getRolePrivileges,
  addRolePrivilege,
  deleteRolePrivileges,
};

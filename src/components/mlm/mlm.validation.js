const Joi = require('joi');
const { objectId } = require('../../validations/custom.validation');

const addByEmail = {
  body: Joi.object().keys({
    userEmail: Joi.string().required().email(),
    parentEmail: Joi.string().email().allow(null, ''),
  }),
};

const addById = {
  body: Joi.object().keys({
    parentId: Joi.string().allow(null, ''),
  }),
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const getReferrer = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateReferrer = {
  params: Joi.object().keys({
    userId: Joi.custom(objectId).required().error(new Error('User Id is required.')),
  }),
  body: Joi.object().keys({
    referrerEmail: Joi.string().email().required().error(new Error('referrerEmail is required.')),
  }),
};

const reward = {
  params: Joi.object().keys({
    userId: Joi.custom(objectId).required().error(new Error('User Id is required.')),
    packagePrice: Joi.number().required().error(new Error('packagePrice is required.')),
  }),
  body: Joi.object().keys({
    orderId: Joi.string().required().error(new Error('Order Id is required')),
  }),
};

const getMlmTree = {
  query: Joi.object().keys({
    email: Joi.string().email().error(new Error('Must provide a valid email address.')),
  }),
};

const updateMlmTree = {
  body: Joi.object().keys({
    email: Joi.string().email().error(new Error('Must provide a valid email address.')),
  }),
};

module.exports = {
  reward,
  addById,
  addByEmail,
  getMlmTree,
  getReferrer,
  updateMlmTree,
  updateReferrer,
};

const Joi = require('joi');
const { btcAddress, objectId } = require('../../validations/custom.validation');

const account = {
  body: Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    type: Joi.string().forbidden().default('account'),
  }),
};

const getBalanceByAccId = {
  query: Joi.object().keys({
    id: Joi.string().custom(objectId).error(new Error('Invalid BTC account id')),
    address: Joi.string().custom(btcAddress).error(new Error('Must be a valid Bitcoin account address.')),
  }),
};

const transfer = {
  query: Joi.object().keys({
    id: Joi.string().custom(objectId).error(new Error('Invalid BTC account id')),
    address: Joi.string().custom(btcAddress).error(new Error('Must be a valid Bitcoin account address.')),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required(),
    destinationAddress: Joi.string().custom(btcAddress).error(new Error('Must be a valid Bitcoin account address.')),
  }),
};

module.exports = {
  account,
  getBalanceByAccId,
  transfer,
};

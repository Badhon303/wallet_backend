const Joi = require('joi');

const getBalance = {
  query: Joi.object().keys({
    address: Joi.string().required(),
    currrency: Joi.string().valid('WOLF', 'EAGLE', 'SNOW').required(),
    type: Joi.string().valid('erc20'),
  }),
};

module.exports = {
  getBalance,
};

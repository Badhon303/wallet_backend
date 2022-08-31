/* eslint-disable no-restricted-syntax */
const Joi = require('joi');
const { helpers } = require('faker');
const cryptaddress = require('multicoin-address-validator');

const getTokenPrice = {
  query: Joi.object().keys({
    token: Joi.string()
      .required()
      .custom((value) => {
        const options = ['WOLF', 'EAGLE', 'SNOW'];
        const values = value.split(',');

        values.forEach((v) => {
          if (!options.includes(v)) {
            return helpers.message(`${v} is not allowed in query params.`);
          }
        });
        return value;
      })
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          switch (err.code) {
            case 'any.empty': {
              return new Error('token is required');
            }
            case 'string.base': {
              return new Error('token must be in string format');
            }
            default: {
              return new Error('token must contain WOLF, EAGLE, SNOW');
            }
          }
        }
      }),
    price_per: Joi.string().default('unit').valid('unit', 'token'),
  }),
};

const cartCalculation = {
  body: Joi.object().keys({
    items: Joi.array().items(
      Joi.object({
        item_id: Joi.string().required(),
        unit_quantity: Joi.number().required(),
      })
    ),
    payment_currency: Joi.string().valid('ETH', 'BTC').required(),
    payment_from_address: Joi.alternatives()
      .conditional('payment_currency', [
        {
          is: 'ETH',
          then: Joi.custom((value) => {
            if (!cryptaddress.validate(value, 'ETH')) {
              return helpers.message(`Invalid ETH address.`);
            }
            return value;
          }),
        },
        {
          is: 'BTC',
          then: Joi.custom((value) => {
            if (!cryptaddress.validate(value, 'BTC', 'testnet')) {
              return helpers.message(`Invalid BTC address.`);
            }
            return value;
          }),
        },
      ])
      .error(new Error('Invalid BTC/ETH account')),
    payment_from_user: Joi.string().email().required(),
  }),
};

const cartSubmit = {
  body: Joi.object().keys({
    otp: Joi.string()
      .min(6)
      .max(6)
      .required()
      .error((errors) => {
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`OTP is required`);
            case 'string.empty':
              return new Error(`OTP cannot be empty.`);
            case 'string.min':
              return new Error(`OTP must contain 6 characters.`);
            case 'string.max':
              return new Error(`OTP must contain 6 characters.`);
            default:
              return new Error(`OTP must be a string.`);
          }
        }
      }),
    items: Joi.array()
      .items(
        Joi.object({
          item_id: Joi.string().required(),
          unit_quantity: Joi.number().required(),
        })
      )
      .min(1),
    payment_currency: Joi.string().valid('ETH', 'BTC').required(),
    payment_from_address: Joi.alternatives()
      .conditional('payment_currency', [
        {
          is: 'ETH',
          then: Joi.custom((value) => {
            if (!cryptaddress.validate(value, 'ETH')) {
              return helpers.message(`Invalid ETH address.`);
            }
            return value;
          }),
        },
        {
          is: 'BTC',
          then: Joi.custom((value) => {
            if (!cryptaddress.validate(value, 'BTC', 'testnet')) {
              return helpers.message(`Invalid BTC address.`);
            }
            return value;
          }),
        },
      ])
      .required()
      .error(new Error('Invalid BTC/ETH account')),
    // payment_from_pkey: Joi.string().required(),
    payment_from_user: Joi.string().email().required(),
    token_received_address: Joi.custom((value) => {
      if (!cryptaddress.validate(value, 'ETH')) {
        return helpers.message(`Invalid ETH address.`);
      }
      return value;
    })
      .required()
      .error(new Error('Invalid wallet address.')),
    transaction_fee: Joi.string()
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          // eslint-disable-next-line default-case
          switch (err.code) {
            case 'any.required': {
              return new Error('transaction_fee is required');
            }
            default: {
              return new Error('transaction_fee takes maximum 8 digits after decimal.');
            }
          }
        }
      }),
  }),
};

const getOrderDetailsById = {
  params: Joi.object().keys({
    orderId: Joi.string().required(),
  }),
};

const getPurchaseHistory = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  getTokenPrice,
  cartCalculation,
  cartSubmit,
  getOrderDetailsById,
  getPurchaseHistory,
};

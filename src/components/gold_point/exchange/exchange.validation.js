/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
const Joi = require('joi');
const { objectId } = require('../../../validations/custom.validation');

const exchange = {
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
    coin: Joi.string()
      .valid('WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH')
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required': {
              return new Error(`'coin' is required.`);
            }
            default: {
              return new Error(`With referral point only WOLF, BTC and ETH can be purchased.`);
            }
          }
        }
      }),

    unit: Joi.number()
      .integer()
      .min(1)
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Unit is erquired`);
            case 'number.min':
              return new Error(`Minimum one unit is required`);
            default:
              return new Error(`Unit must be a number`);
          }
        }
      }),
    price: Joi.number().required().error(new Error(`Price is required`)),
    // pkey: Joi.string().default('<pleasesendfromadminaddress!>'),
    toAddress: Joi.string().when('coin', [
      {
        is: 'WOLF',
        then: Joi.string()
          .regex(/^(0[xX]){1}[A-Fa-f0-9]{40}/)
          .required()
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required': {
                  return new Error(`'Toaddress' is required.`);
                }
                default: {
                  return new Error(`'Toaddress' must be a valid Ethereum address.`);
                }
              }
            }
          }),
      },
      {
        is: 'EAGLE',
        then: Joi.string()
          .regex(/^(0[xX]){1}[A-Fa-f0-9]{40}/)
          .required()
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required': {
                  return new Error(`'Toaddress' is required.`);
                }
                default: {
                  return new Error(`'Toaddress' must be a valid Ethereum address.`);
                }
              }
            }
          }),
      },
      {
        is: 'SNOw',
        then: Joi.string()
          .regex(/^(0[xX]){1}[A-Fa-f0-9]{40}/)
          .required()
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required': {
                  return new Error(`'Toaddress' is required.`);
                }
                default: {
                  return new Error(`'Toaddress' must be a valid Ethereum address.`);
                }
              }
            }
          }),
      },
      {
        is: 'ETH',
        then: Joi.string()
          .regex(/^(0[xX]){1}[A-Fa-f0-9]{40}/)
          .required()
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required': {
                  return new Error(`'Toaddress' is required.`);
                }
                default: {
                  return new Error(`'Toaddress' must be a valid Ethereum address.`);
                }
              }
            }
          }),
      },
      {
        is: 'BTC',
        then: Joi.string()
          .regex(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
          .required()
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required': {
                  return new Error(`'Toaddress' is required.`);
                }
                default: {
                  return new Error(`'Toaddress' must be a valid Bitcoin address.`);
                }
              }
            }
          }),
      },
    ]),
    coinAmount: Joi.number().required().error(new Error('coinAmount is required')),
    bonusAmount: Joi.number().required().error(new Error('bonusAmount is required')),
    totalCoinAmount: Joi.number().required().error(new Error('totalCoinAmount is required')),
    goldPointAmount: Joi.number().required().error(new Error('goldPointAmount is required')),
    transactionFee: Joi.number()
      .precision(8)
      .required()
      .error((errors) => {
        for (const err of errors) {
          console.log(err.code);
          // eslint-disable-next-line default-case
          switch (err.code) {
            case 'any.required':
              return new Error('TransactionFee is required.');
            default:
              return new Error('TransactionFee takes maximum 8 digits after decimal.');
          }
        }
      }),
  }),
};
const createNewExchangeRate = {
  body: Joi.object().keys({
    coin: Joi.string()
      .valid('WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH')
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Coin is required.`);
            case 'string.empty':
              return new Error(`Coin must not be empty.`);
            default:
              return new Error(`Coin must be one of these: 'WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH'.`);
          }
        }
      }),
    bonus: Joi.number().min(0).max(100).error(new Error(`Bonus must be in between 0 - 100`)),
    unit: Joi.number().error(new Error(`Unit must be a number`)),
    status: Joi.string()
      .valid('Enabled', 'Disabled')
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'string.base':
              return new Error(`Status must be a string.`);
            default:
              return new Error(`Status can be either 'Enabled' or 'Disabled'`);
          }
        }
      }),
  }),
};

const updateExchangeRates = {
  body: Joi.array()
    .items(
      Joi.object({
        coin: Joi.string()
          .valid('WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH')
          .required()
          .error((errors) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const err of errors) {
              console.log(err.code);
              switch (err.code) {
                case 'any.required':
                  return new Error(`Coin is required.`);
                case 'string.empty':
                  return new Error(`Coin must not be empty.`);
                default:
                  return new Error(`Coin must be one of these: 'WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH'.`);
              }
            }
          }),
        bonus: Joi.number().min(0).max(100).error(new Error(`Bonus must be in between 0 - 100`)),
        unit: Joi.number().error(new Error(`Unit must be a number`)),
        status: Joi.string()
          .valid('Enabled', 'Disabled')
          .error((errors) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const err of errors) {
              console.log(err.code);
              switch (err.code) {
                case 'string.base':
                  return new Error(`Status must be a string.`);
                default:
                  return new Error(`Status can be either 'Enabled' or 'Disabled'`);
              }
            }
          }),
      })
    )
    .min(1),
};

const getExchangeRates = {
  query: Joi.object().keys({
    coin: Joi.string()
      .valid('WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH')
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Coin is required.`);
            case 'string.empty':
              return new Error(`Coin must not be empty.`);
            default:
              return new Error(`Coin must be one of these: 'WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH'.`);
          }
        }
      }),
    status: Joi.string()
      .valid('Enabled', 'Disabled')
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'string.empty':
              return new Error(`Status must not be empty.`);
            default:
              return new Error(`Status can be either 'Enabled' or 'Disabled' `);
          }
        }
      }),
  }),
};

const evaluateExchangeInpute = {
  query: Joi.object().keys({
    coin: Joi.string()
      .valid('WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH')
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Coin is required.`);
            case 'string.empty':
              return new Error(`Coin must not be empty.`);
            default:
              return new Error(`Coin must be one of these: 'WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH'.`);
          }
        }
      }),
    unit: Joi.number()
      .min(1)
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Unit is required.`);
            default:
              return new Error(`Minimum 1 unit is required.`);
          }
        }
      }),
  }),
};

const exchangeHistoryValidation = {
  query: Joi.object().keys({
    email: Joi.string().email(),
    coin: Joi.string()
      .valid('WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH')
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Coin is required.`);
            case 'string.empty':
              return new Error(`Coin must not be empty.`);
            default:
              return new Error(`Coin must be one of these: 'WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH'.`);
          }
        }
      }),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2021),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSingleExchangeDetails = {
  params: Joi.object().keys({
    exchangeId: Joi.string().custom(objectId),
  }),
};

const calculateTotalExchanged = {
  query: Joi.object().keys({
    coin: Joi.string()
      .valid('WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH')
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Coin is required.`);
            case 'string.empty':
              return new Error(`Coin must not be empty.`);
            default:
              return new Error(`Coin must be one of these: 'WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH'.`);
          }
        }
      }),
  }),
};

module.exports = {
  exchange,
  getExchangeRates,
  updateExchangeRates,
  createNewExchangeRate,
  evaluateExchangeInpute,
  calculateTotalExchanged,
  getSingleExchangeDetails,
  exchangeHistoryValidation,
};

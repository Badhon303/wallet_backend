/* eslint-disable no-restricted-syntax */
const Joi = require('joi');

const dollarPrice = {
  query: Joi.object().keys({
    amount: Joi.number()
      .required()
      .error((errors) => {
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error('Must provide the amount of Referral Points.');
            }
            case 'number.base': {
              return new Error('Amount of Referral Points must be in number format');
            }
            default: {
              return new Error('Amount of Referral Points must be in number format');
            }
          }
        }
      }),
  }),
};

const updateReferralPointPrice = {
  body: Joi.object().keys({
    price: Joi.number()
      .required()
      .error((errors) => {
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error('Must provide the Referral Point unit price.');
            }
            case 'number.base': {
              return new Error('Price must be in number format');
            }
            default: {
              return new Error('Price must be in number format');
            }
          }
        }
      }),
  }),
};

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
    refPoint: Joi.number()
      .required()
      .error((errors) => {
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error('Must provide the amount of Referral Points.');
            }
            case 'number.base': {
              return new Error('Referral Points must be in number format');
            }
            default: {
              return new Error('Referral Points must be in number format');
            }
          }
        }
      }),
    dollarPrice: Joi.number()
      .required()
      .error((errors) => {
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error('Must provide the Dollar price of Referral Points.');
            }
            case 'number.base': {
              return new Error('Dollar price must be in number format');
            }
            default: {
              return new Error('Dollar price must be in number format');
            }
          }
        }
      }),
    currency: Joi.string()
      .valid('WOLF', 'BTC', 'ETH')
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error(`'Currency' is required.`);
            }
            default: {
              return new Error(`With referral point only WOLF, BTC and ETH can be purchased.`);
            }
          }
        }
      }),
    amountOfCurrency: Joi.number()
      .required()
      .error((errors) => {
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error('Must provide the amount of selected currency.');
            }
            case 'number.base': {
              return new Error('Amount of currency must be in number format');
            }
            default: {
              return new Error('Amount of currency must be in number format');
            }
          }
        }
      }),
    toAddress: Joi.string().when('currency', [
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
    transactionFee: Joi.string()
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

const exchangeRefPoint = {
  body: Joi.object().keys({
    currency: Joi.string()
      .valid('WOLF', 'BTC', 'ETH')
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error(`'Currency' is required.`);
            }
            default: {
              return new Error(`With referral point only WOLF, BTC and ETH can be purchased.`);
            }
          }
        }
      }),
    type: Joi.string().when('currency', [
      {
        is: 'WOLF',
        then: Joi.string()
          .required()
          .valid('erc20')
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required': {
                  return new Error(`'Type' is required.`);
                }
                default: {
                  return new Error(`type must be 'erc20' when 'WOLF' is selected.`);
                }
              }
            }
          }),
      },
      {
        is: 'BTC',
        then: Joi.string()
          .valid('coin')
          .required()
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required': {
                  return new Error(`'Type' is required.`);
                }
                default: {
                  return new Error(`type must be 'coin' when 'BTC' is selected.`);
                }
              }
            }
          }),
      },
      {
        is: 'ETH',
        then: Joi.string()
          .valid('coin')
          .required()
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required': {
                  return new Error(`'Type' is required.`);
                }
                default: {
                  return new Error(`type must be 'coin' when 'ETH' is selected.`);
                }
              }
            }
          }),
      },
    ]),
    from_type: Joi.string()
      .valid('admin')
      .required()
      .error((errors) => {
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error(`'From Type' is required.`);
            }
            default: {
              return new Error(`'From type' must be 'admin'`);
            }
          }
        }
      }),
    pkey: Joi.string().default('<pleasesendfromadminaddress!>'),
    toAddress: Joi.string().when('currency', [
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
    amount: Joi.number().required().error(new Error('amount is required')),
  }),
};

const getRewardHistory = {
  query: Joi.object().keys({
    orderId: Joi.string().error((errors) => {
      for (const err of errors) {
        // eslint-disable-next-line default-case
        switch (err.code) {
          case 'string.empty':
            return new Error('Order Id cannot be empty.');
          default: {
            return new Error('Order id is required when admin wants to reward list of an order.');
          }
        }
      }
    }),
    sortBy: Joi.string().error(new Error(`Sort by cannot be empty.`)),
    limit: Joi.number().error(new Error(`Limit must be a number`)),
    page: Joi.number().error(new Error('Number is required.')),
  }),
};

module.exports = { exchange, exchangeRefPoint, dollarPrice, updateReferralPointPrice, getRewardHistory };

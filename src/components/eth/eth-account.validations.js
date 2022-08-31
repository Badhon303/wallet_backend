/* eslint-disable no-restricted-syntax */
const Joi = require('joi');

const getBalance = {
  query: Joi.object().keys({
    address: Joi.string()
      // .regex(/^(0[xX]){1}[A-Fa-f0-9]{40}|^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
      .required()
      .error(new Error('Invalid Bitcoin or Ethereum Account')),
    currency: Joi.string().valid('WOLF', 'EAGLE', 'SNOW', 'ETH', 'BTC').required(),
    type: Joi.string().valid('erc20', 'coin').required(),
  }),
};

const calculateTxFee = {
  body: Joi.object().keys({
    currency: Joi.string()
      .valid('WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH')
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          switch (err.code) {
            case 'string.base': {
              return new Error('currency must be in string format');
            }
            default: {
              return new Error('Must select a currency and currency can be only WOLF, EAGLE or SNOW');
            }
          }
        }
      }),
    type: Joi.alternatives().conditional('currency', [
      {
        is: 'BTC' || 'ETH',
        then: Joi.string().valid('coin').required().error(new Error(`type must be 'coin' while transfering 'BTC' or 'ETH'`)),
      },
      {
        is: 'ETH',
        then: Joi.string().valid('coin').required().error(new Error(`type must be 'coin' while transfering 'BTC' or 'ETH'`)),
      },
      {
        is: 'WOLF',
        then: Joi.string().valid('erc20').required().error(new Error(`type must be 'erc20' while transfering 'WOLF'`)),
      },
      {
        is: 'EAGLE',
        then: Joi.string().valid('erc20').required().error(new Error(`type must be 'erc20' while transfering 'EAGLE'`)),
      },
      {
        is: 'SNOW',
        then: Joi.string().valid('erc20').required().error(new Error(`type must be 'erc20' while transfering 'SNOW'`)),
      },
    ]),
    user: Joi.string().email().required(),

    from_address: Joi.string()
      .max(42)
      // .regex(/^(0[xX]){1}[A-Fa-f0-9]{40}|^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
      .required()
      .error(new Error('Must provide a valid account address.')),

    to_address: Joi.string()
      .max(42)
      // .regex(/^(0[xX]){1}[A-Fa-f0-9]{40}|^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
      .required()
      .error(new Error('Must provide a valid account address.')),

    amount: Joi.alternatives().conditional('currency', [
      {
        is: 'WOLF',
        then: Joi.string()
          // eslint-disable-next-line security/detect-unsafe-regex
          .regex(/^\d*(\.\d{1,8})?$/)
          .error((errors) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const err of errors) {
              switch (err.code) {
                case 'string.base': {
                  return new Error('WOLF must be in string format');
                }
                default: {
                  return new Error('WOLF can take maximum 8 digits after decimel');
                }
              }
            }
          }),
      },
      {
        is: 'EAGLE',
        then: Joi.string()
          .regex(/^\d+$/)
          .error((errors) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const err of errors) {
              switch (err.code) {
                case 'string.base': {
                  return new Error('EAGLE must be in string format');
                }
                default: {
                  return new Error('EAGLE does not allow decimel numbers.');
                }
              }
            }
          }),
      },
      {
        is: 'SNOW',
        then: Joi.string()
          .regex(/^\d+$/)
          .error((errors) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const err of errors) {
              switch (err.code) {
                case 'string.base': {
                  return new Error('SNOW must be in string format');
                }
                default: {
                  return new Error('SNOW does not allow decimel numbers.');
                }
              }
            }
          }),
      },
      { is: 'BTC', then: Joi.string().regex(/^\d*(\.\d{1,8})?$/) },
      { is: 'ETH', then: Joi.string().regex(/^\d*(\.\d{1,8})?$/) },
    ]),
  }),
};

const transferToken = {
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
    currency: Joi.string()
      .valid('WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH')
      .error(new Error('Must select a currency and currency can be only WOLF, EAGLE or SNOW'))
      .required(),
    type: Joi.alternatives().conditional('currency', [
      {
        is: 'BTC' || 'ETH',
        then: Joi.string().valid('coin').required().error(new Error(`type must be 'coin' while transfering 'BTC' or 'ETH'`)),
      },
      {
        is: 'ETH',
        then: Joi.string().valid('coin').required().error(new Error(`type must be 'coin' while transfering 'BTC' or 'ETH'`)),
      },
      {
        is: 'WOLF',
        then: Joi.string().valid('erc20').required().error(new Error(`type must be 'erc20' while transfering 'WOLF'`)),
      },
      {
        is: 'EAGLE',
        then: Joi.string().valid('erc20').required().error(new Error(`type must be 'erc20' while transfering 'EAGLE'`)),
      },
      {
        is: 'SNOW',
        then: Joi.string().valid('erc20').required().error(new Error(`type must be 'erc20' while transfering 'SNOW'`)),
      },
    ]),

    user: Joi.string().email().required(),

    from_address: Joi.string()
      .max(42)
      // .regex(/^(0[xX]){1}[A-Fa-f0-9]{40}|^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
      .error(new Error('Must provide a valid account address.')),

    to_address: Joi.string()
      .max(42)
      // .regex(/^(0[xX]){1}[A-Fa-f0-9]{40}|^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
      .required()
      .error(new Error('Must provide a valid account address.')),

    amount: Joi.alternatives().conditional('currency', [
      {
        is: 'WOLF',
        then: Joi.string()
          // eslint-disable-next-line security/detect-unsafe-regex
          .regex(/^\d*(\.\d{1,8})?$/)
          .error((errors) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const err of errors) {
              switch (err.code) {
                case 'string.base': {
                  return new Error('WOLF must be in string format');
                }
                default: {
                  return new Error('WOLF can take maximum 8 digits after decimel');
                }
              }
            }
          }),
      },
      {
        is: 'EAGLE',
        then: Joi.string()
          .regex(/^\d+$/)
          .error((errors) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const err of errors) {
              switch (err.code) {
                case 'string.base': {
                  return new Error('EAGLE must be in string format');
                }
                default: {
                  return new Error('EAGLE does not allow decimel numbers.');
                }
              }
            }
          }),
      },
      {
        is: 'SNOW',
        then: Joi.string()
          .regex(/^\d+$/)
          .error((errors) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const err of errors) {
              switch (err.code) {
                case 'string.base': {
                  return new Error('SNOW must be in string format');
                }
                default: {
                  return new Error('SNOW does not allow decimel numbers.');
                }
              }
            }
          }),
      },
      { is: 'BTC', then: Joi.string().regex(/^\d*(\.\d{1,8})?$/) },
      { is: 'ETH', then: Joi.string().regex(/^\d*(\.\d{1,8})?$/) },
    ]),
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

module.exports = { getBalance, transferToken, calculateTxFee };

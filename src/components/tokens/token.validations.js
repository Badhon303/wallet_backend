const Joi = require('joi');

const getTokenInfo = {
  query: Joi.object().keys({
    keys: Joi.string()
      .custom((value) => {
        const options = ['price_per_token', 'token_quantity_per_unit', 'selling_units_quantity', 'price_per_unit'];
        const values = value.split(',');

        values.forEach((v) => {
          if (!options.includes(v)) {
            return helpers.message(`${v} is not allowed in query params.`);
          }
        });
        return value;
      })
      .error(new Error('Invalid search key(s).')),
    token: Joi.string()
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
      .error(new Error('token must be one of these WOLF, EAGLE, SNOW')),
  }),
};

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

const update = {
  params: Joi.object().keys({
    tokenName: Joi.string()
      .valid('WOLF', 'EAGLE', 'SNOW')
      .required()
      .error(new Error('token name must be WOLF, EAGLE or SNOW')),
  }),
  body: Joi.object()
    .keys({
      price_per_token: Joi.string(),
      token_quantity_per_unit: Joi.string(),
      selling_units_quantity: Joi.string(),
    })
    .min(1)
    .error(new Error('Nothing to update.')),
};

const getTokenAmount = {
  query: Joi.object().keys({
    token: Joi.string()
      .valid('WOLF', 'BTC', 'ETH')
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error('Token is required');
            }
            default: {
              return new Error(`Only 'WOLF', 'BTC' and 'ETH' are valid token`);
            }
          }
        }
      }),
    dollar: Joi.number()
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          switch (err.code) {
            case 'any.required': {
              return new Error('Amount is required.');
            }
            case 'number.base': {
              return new Error('Amount must be in number format');
            }
            default: {
              return new Error('Amount must be in number format');
            }
          }
        }
      }),
  }),
};

module.exports = { getTokenInfo, getTokenPrice, update, getTokenAmount };

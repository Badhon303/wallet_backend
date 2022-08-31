/* eslint-disable no-restricted-syntax */
const Joi = require('joi');
const { objectId } = require('../../validations/custom.validation');

const triggerGoldPoint = {
  body: Joi.object().keys({
    type: Joi.string()
      .valid('all', 'single')
      .required()
      .error((errors) => {
        for (const err of errors) {
          switch (err.code) {
            case 'any.required':
              return new Error(`type is required `);
            case 'string.empty':
              return new Error('Type must not be empty.');
            default:
              return new Error(`and must be either "single" or "multiple"`);
          }
        }
      }),
    token: Joi.string().when('type', [
      {
        is: 'all',
        then: Joi.string()
          .valid('EAGLE', 'SNOW')
          .required()
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required':
                  return new Error(`Token is required`);
                case 'string.empty':
                  return new Error(`Token must not be empty.`);
                default:
                  return new Error(`Token must be either 'EAGLE' or 'SNOW'`);
              }
            }
          }),
      },
    ]),

    email: Joi.string().when('type', [
      {
        is: 'single',
        then: Joi.string()
          .email()
          .required()
          .error((errors) => {
            for (const err of errors) {
              switch (err.code) {
                case 'any.required':
                  return new Error(`Email is required.`);
                case 'string.email':
                  return new Error(`Must be a valid email.`);
                default:
                  return new Error(`Email must not be empty.`);
              }
            }
          }),
      },
    ]),
    scheduleDate: Joi.string().when('type', [
      {
        is: 'all',
        then: Joi.string().required().error(new Error('Must provide schedule date')),
      },
    ]),
    goldPoint: Joi.string()
      .regex(/^(\-\.\d{1,7})?$|^(\-)\d*(\.\d{1,7})?$|^\d*(\.\d{1,7})?$/)
      .required()
      .error((errors) => {
        for (const err of errors) {
          // eslint-disable-next-line default-case
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error('Goldpoint is required.');
            case 'string.base':
              return new Error('Gold point must be string');
            case 'string.empty':
              return new Error('Gold point cannot be empty.');
            case 'string.pattern.base':
              return new Error(`Gold point takes only digits. And maximum 7 digits after decimel point`);
            default: {
              return new Error('Gold point takes maximum 7 digits after decimal point');
            }
          }
        }
      }),
  }),
};

const getTriggerHistoryAll = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const fetchTrigger = {
  params: Joi.object().keys({
    triggerId: Joi.string().required(),
  }),
};

const deleteTrigger = {
  params: Joi.object().keys({
    triggerId: Joi.string()
      .custom(objectId)
      .required()
      .error((errors) => {
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error('Trigger Id is required.');

            default:
              return new Error('Trigger id must be a valid id');
          }
        }
      }),
  }),
};

const getDollarPrice = {
  query: Joi.object().keys({
    goldPointAmount: Joi.number(),
  }),
};

const fetchOwnAllTriggerHistory = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  triggerGoldPoint,
  getTriggerHistoryAll,
  fetchTrigger,
  deleteTrigger,
  getDollarPrice,
  fetchOwnAllTriggerHistory,
};

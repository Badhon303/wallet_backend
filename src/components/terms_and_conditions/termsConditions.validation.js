const Joi = require('joi');

const createTermsAndConditions = {
  body: Joi.object().keys({
    preamble: Joi.string()
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'string.empty':
              return new Error('Preamble cannot be empty.');
            case 'any.required':
              return new Error(`Preamble is required.`);
            default:
              return new Error(`Preamble must be string.`);
          }
        }
      }),
    consent: Joi.string()
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'string.empty':
              return new Error('Consent cannot be empty.');
            case 'any.required':
              return new Error(`Consent is required.`);
            default:
              return new Error(`Consent must be string.`);
          }
        }
      }),
    suggessions: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'string.empty':
            return new Error(`Suggetions cannot be empty`);
          default:
            return new Error(`Suggessions must be string.`);
        }
      }
    }),
    laws: Joi.array()
      .items(Joi.string().required())
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'array.base':
              return new Error(`Laws must be an array.`);
            case 'array.includesRequiredUnknowns': {
              return new Error(`Laws cannot ba an empty array`);
            }
            default:
              return new Error('Laws must be string.');
          }
        }
      }),
  }),
};

const updateSections = {
  body: Joi.object().keys({
    preamble: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'string.empty':
            return new Error('Preamble cannot be empty.');
          case 'any.required':
            return new Error(`Preamble is required.`);
          default:
            return new Error(`Preamble must be string.`);
        }
      }
    }),
    consent: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'string.empty':
            return new Error('Consent cannot be empty.');
          case 'any.required':
            return new Error(`Consent is required.`);
          default:
            return new Error(`Consent must be string.`);
        }
      }
    }),
    suggessions: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'string.empty':
            return new Error(`Suggetions cannot be empty`);
          default:
            return new Error(`Suggessions must be string.`);
        }
      }
    }),
    laws: Joi.array()
      .items(Joi.string().required())
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'array.base':
              return new Error(`Laws must be an array.`);
            case 'array.includesRequiredUnknowns': {
              return new Error(`Laws cannot ba an empty array`);
            }
            default:
              return new Error('Laws must be string.');
          }
        }
      }),
  }),
};

const addNewConditions = {
  body: Joi.object().keys({
    conditions: Joi.array()
      .items(Joi.string().required())
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Condition(s) is/are required.`);
            case 'array.base':
              return new Error(`Conditions must be an array.`);
            case 'array.includesRequiredUnknowns': {
              return new Error(`Conditions cannot ba an empty array`);
            }
            default:
              return new Error(`Conditions cannot ba an empty array`);
          }
        }
      }),
  }),
};

const removeConditions = {
  body: {
    indices: Joi.array()
      .items(Joi.number())
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Indices are required.`);
            case 'array.base':
              return new Error(`Indices must be an array.`);
            case 'array.includesRequiredUnknowns':
              return new Error(`Indices cannot ba an empty array`);
            default:
              return new Error(`Indices must be an array of numbers`);
          }
        }
      }),
  },
};

module.exports = { createTermsAndConditions, updateSections, addNewConditions, removeConditions };

const Joi = require('joi');
const { error } = require('../config/logger');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    nickName: Joi.string()
      .regex(/^[a-zA-Z, ]*$/, 'Can be only characters')
      .min(2)
      .max(10)
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);

          switch (err.code) {
            case 'any.required':
              return new Error('Nickname is required');
            case 'string.max':
              return new Error('Nickname takes maximum 10 digits');
            default:
              return new Error('Nickname contains characters only');
          }
        }
      }),
    email: Joi.string().email().required(),
    // password: Joi.string().custom(password),
    password: Joi.string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{4,8}$/)
      .min(4)
      .max(8)
      .error(new Error('Password must be 4 to 8 characters long and must contain a character and a number')),
    termsOfUse: Joi.boolean()
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error('TermsOfUse is required.');
            default:
              return new Error('TermsOfUse must be a boolean value');
          }
        }
      }),
  }),
  query: Joi.object().keys({
    referrerId: Joi.string(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const matchOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().min(6).required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  matchOTP,
};

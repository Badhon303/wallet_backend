const Joi = require('joi');

const qNode = Joi.object().keys({
  id: Joi.string().required,
  parent: Joi.string().required(),
  childNo: [Joi.number().required()],
  children: [Joi.string()],
  level: Joi.number().integer(),
});

module.exports = {
  qNode,
};

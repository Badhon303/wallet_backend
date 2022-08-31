const httpStatus = require('http-status');

const EmailTemplate = require('./templetes.model');

const ApiError = require('../../utils/ApiError');

const getTemplateCreationOptions = async (args) => {
  const options = {};
  if (args.body) {
    options.body = args.body.replace(/&lt;/g, '<');
  }
  if (args.title) options.title = args.title;
  if (args.aimTo) options.aimTo = args.aimTo;
  if (args.closing) options.closing = args.closing;
  if (args.category) options.category = args.category;
  if (args.greetings) options.greetings = args.greetings;
  if (args.signature) options.signature = args.signature;
  if (args.description) options.description = args.description;

  return options;
};

const create = async (args) => {
  let template = await EmailTemplate.findOne({ aimTo: args.aimTo, category: args.category });

  if (template) {
    throw new ApiError(httpStatus.CONFLICT, `An email template to ${args.aimTo} regarding ${args.category} does exists.`);
  }

  const options = await getTemplateCreationOptions(args);
  template = new EmailTemplate(options);
  await template.save();
};

const getAll = async (role) => {
  if (role !== 'admin') throw new ApiError(httpStatus.FORBIDDEN, `Only admins can view all email templates.`);
  const templates = await EmailTemplate.find({}, 'title');
  console.log(templates);
  return templates;
};

const getById = async (templateID) => {
  console.log(templateID);
  const template = await EmailTemplate.findById(templateID);
  if (!template) throw new ApiError(httpStatus.NOT_FOUND, `Template does not exists.`);
  return template;
};

const getByCategoryAndAimTo = async (category, aimTo) => {
  let template = null;
  template = await EmailTemplate.find({ category, aimTo });
  if (template) return template[0];
  return template;
};

const update = async (templateId, args) => {
  const options = await getTemplateCreationOptions(args);
  const result = await EmailTemplate.findByIdAndUpdate(templateId, options, { new: true });
  if (!result) throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Could not update email template`);
  return result;
};

const remove = async (templateId) => {
  const result = await EmailTemplate.findByIdAndDelete(templateId);
  if (!result) throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Could not delete email template`);
  return result;
};

module.exports = {
  create,
  update,
  remove,
  getAll,
  getById,
  getByCategoryAndAimTo,
};

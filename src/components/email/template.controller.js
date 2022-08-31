const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const templateService = require('./template.servece');

const getAll = catchAsync(async (req, res) => {
  const { role } = req.user;
  const templates = await templateService.getAll(role);
  return res.status(httpStatus.OK).json(templates);
});

const getById = catchAsync(async (req, res) => {
  const { templateId } = req.params;
  const result = await templateService.getById(templateId);
  return res.status(httpStatus.OK).json(result);
});

const create = catchAsync(async (req, res) => {
  const options = req.body;
  console.log(options);
  const result = await templateService.create(options);
  return res.status(httpStatus.CREATED).json({ message: `Email template created successfully.`, result });
});

const update = catchAsync(async (req, res) => {
  const { templateId } = req.params;
  const options = req.body;
  console.log(options);
  const result = await templateService.update(templateId, options);
  return res.status(httpStatus.OK).json({ message: `Template updated successfully`, result });
});

const remove = catchAsync(async (req, res) => {
  const { templateId } = req.params;
  const result = await templateService.remove(templateId);
  return res.status(httpStatus.OK).json({ message: `Template deleted successfully`, result });
});

module.exports = {
  create,
  update,
  remove,
  getAll,
  getById,
};

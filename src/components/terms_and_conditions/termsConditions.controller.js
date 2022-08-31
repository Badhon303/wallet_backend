const httpStatus = require('http-status');

const catchAsync = require('../../utils/catchAsync');
const termsConditionsService = require('./termsConditions.service');

const create = catchAsync(async (req, res) => {
  const { preamble, consent, suggessions, laws } = req.body;
  const response = await termsConditionsService.create(preamble, consent, suggessions, laws);
  return res.status(httpStatus.CREATED).json({ ...response });
});

const getTermsConditions = catchAsync(async (req, res) => {
  const termsCoditions = await termsConditionsService.fetchTermsConditions();
  return res.status(httpStatus.OK).json(termsCoditions);
});

const updateSections = catchAsync(async (req, res) => {
  const options = req.body;
  const result = await termsConditionsService.updateSections(options);
  return res.status(httpStatus.OK).json({ ...result });
});

const addnewConditions = catchAsync(async (req, res) => {
  const { conditions } = req.body;
  const result = await termsConditionsService.addNewLaws(conditions);
  return res.status(httpStatus.OK).json({ ...result });
});

const removeConditions = catchAsync(async (req, res) => {
  const { indices } = req.body;
  const result = await termsConditionsService.removelaws(indices);
  return res.status(httpStatus.OK).json({ ...result });
});
module.exports = { create, updateSections, addnewConditions, removeConditions, getTermsConditions };

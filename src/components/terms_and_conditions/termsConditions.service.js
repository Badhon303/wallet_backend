const httpStatus = require('http-status');
const TermsConditions = require('./termsConditions.model');

const ApiError = require('../../utils/ApiError');

const create = async (preamble, consent, suggessions, laws) => {
  const existingTermsConditions = await TermsConditions.find();

  if (existingTermsConditions && existingTermsConditions.length > 0)
    throw new ApiError(
      httpStatus.CONFLICT,
      `Terms and Conditions exists. You can update existing sections in that document.`
    );
  let termsConditions = {};
  termsConditions.preamble = preamble;
  termsConditions.consent = consent;
  if (suggessions) termsConditions.suggessions = suggessions;
  if (laws && laws.length > 0) {
    termsConditions.laws = laws.map((law) => law);
  }

  const termsConditionsObj = new TermsConditions({ ...termsConditions });
  const result = await termsConditionsObj.save();
  return { message: `Terms and conditions created successfully`, result };
};

const fetchTermsConditions = async () => {
  const termsConditions = await TermsConditions.find();
  if (!termsConditions || !(termsConditions.length > 0)) {
    throw new ApiError(httpStatus.NOT_FOUND, `Terms and conditions are not set yet.`);
  }

  return termsConditions[0];
};

const updateSections = async (options) => {
  console.log(options);
  let termsConditions = {};
  if (options.consent) termsConditions.consent = options.consent;
  if (options.preamble) termsConditions.preamble = options.preamble;
  if (options.suggessions) termsConditions.suggessions = options.suggessions;
  if (options.laws && options.laws.length > 0) termsConditions.laws = options.laws;

  console.log(termsConditions);

  const updatedTermsConditions = await TermsConditions.findOneAndUpdate({}, { ...termsConditions }, { new: true });
  return { message: `Section(s) updated successfully.`, result: updatedTermsConditions };
};

const addNewLaws = async (newLaws) => {
  const termsConditions = await TermsConditions.find({}, 'laws').exec();
  if (newLaws && newLaws.length > 0 && termsConditions.length > 0) {
    newLaws.forEach((law) => {
      termsConditions[0].laws.push(law);
    });

    await termsConditions[0].save();
  }

  return { message: `New condition(s) is/are added successfully.`, result: termsConditions[0].laws };
};

const removelaws = async (indices) => {
  const laws = await TermsConditions.find({}, 'laws').exec();
  console.log(laws);
  if (indices && indices.length > 0 && laws.length > 0) {
    let indexOfIndices = 0;
    const newLaws = [];

    indices.sort();
    laws[0].laws.forEach((law, index) => {
      let hastobeRemoved = false;
      for (let i = indexOfIndices; i < indices.length; i += 1) {
        if (index === indices[i] - 1) {
          hastobeRemoved = true;
          indexOfIndices = i;
          break;
        }
      }

      if (!hastobeRemoved) newLaws.push(law);
    });

    laws[0].laws = newLaws;
    await laws[0].save();
    return { message: `Condition(s) has/have been removed successfully`, result: laws[0] };
  }
};
module.exports = { create, updateSections, addNewLaws, removelaws, fetchTermsConditions };

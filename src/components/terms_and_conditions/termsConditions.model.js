const mongoose = require('mongoose');
const { paginate, toJSON } = require('../../models/plugins');

const termsConditionsSchema = new mongoose.Schema(
  {
    preamble: { type: String, required: true },
    suggessions: { type: String },
    laws: [String],
    consent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
termsConditionsSchema.plugin(toJSON);
termsConditionsSchema.plugin(paginate);

/**
 * @typedef TermsConditions
 */
const TermsConditions = mongoose.model('TermsConditions', termsConditionsSchema);

module.exports = TermsConditions;

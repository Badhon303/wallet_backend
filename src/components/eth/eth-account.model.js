const mongoose = require('mongoose');
const { toJSON } = require('../../models/plugins');

// const validator = require('validator');

const ethAccoountSchema = mongoose.Schema(
  {
    address: {
      type: String,
      unique: true,
      required: true,
    },
    balance: {
      type: Number,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: [true, 'User must be unique'],
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

ethAccoountSchema.plugin(toJSON);

/**
 * @typedef ethAccoountSchema
 */
const EthAccount = mongoose.model('EthAccount', ethAccoountSchema);

module.exports = EthAccount;

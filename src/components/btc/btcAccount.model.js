const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const btcAccSchema = new mongoose.Schema(
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

btcAccSchema.plugin(toJSON);
btcAccSchema.plugin(paginate);

/**
 * @typedef BtcAccount
 */
const BtcAccount = mongoose.model('BtcAccount', btcAccSchema);
module.exports = BtcAccount;

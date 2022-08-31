const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const refTxHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    txId: {
      type: String,
      unique: [true, 'Transaction Id must be unique.'],
      required: [true, 'Transaction Id is required'],
      sparse: true,
    },
    refPointUsed: {
      type: Number,
      required: [true, 'Referral Point is required'],
    },
    dollarPrice: {
      type: Number,
      required: [true, 'dollar price is required'],
    },
    currency: {
      type: String,
      enum: ['WOLF', 'ETH', 'BTC'],
      required: [true, 'currency is required'],
    },
    toAddress: {
      type: String,
      required: [true, 'to address is required'],
    },
    purchasedCurrencyAmount: {
      type: Number,
      required: [true, 'purchased currency amount is required'],
    },
    status: {
      type: Boolean,
      required: [true, 'purchase status is required'],
    },
    createdAt: {
      type: Date,
      deafult: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// refTxHistorySchema.plugin(toJSON);
refTxHistorySchema.plugin(paginate);

/**
 * @typedef RefTxHistory
 */
const RefTxHistory = mongoose.model('RefTxHistory', refTxHistorySchema);

module.exports = RefTxHistory;

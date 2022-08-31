const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const refRewardHistorySchema = new mongoose.Schema(
  {
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    purchasedAmount: {
      type: Number,
      required: [true, 'Purchased amount is required'],
    },
    receivedPercentage: {
      type: Number,
      required: [true, 'Received Percentage is required'],
    },
    receivedAmount: {
      type: Number,
      required: [true, 'Received amount is required'],
    },
    associatedTransaction: {
      type: String,
      required: [true, 'Must provide order id'],
    },
    level: {
      type: Number,
      required: [true, 'Level is required'],
    },
  },
  {
    timestamps: true,
  }
);

// refTxHistorySchema.plugin(toJSON);
refRewardHistorySchema.plugin(paginate);
refRewardHistorySchema.plugin(toJSON);

/**
 * @typedef RefRewardHistory
 */
const RefRewardHistory = mongoose.model('RefRewardHistory', refRewardHistorySchema);

module.exports = RefRewardHistory;

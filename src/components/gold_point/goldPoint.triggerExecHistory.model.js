const mongoose = require('mongoose');
const { paginate, toJSON } = require('../../models/plugins');

const gpTriggerExecHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
    },
    trigger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GoldPointTrigger',
      required: [true, 'trigger id is required'],
    },
    goldPointBeforeTrigger: {
      type: Number,
      required: [true, 'gold point before execution is required'],
    },
    receivedGoldPointAmount: {
      type: Number,
      required: [true, 'amount of gold point provided or deducted is required'],
    },
    goldPointAfterTrigger: {
      type: Number,
      required: [true, 'total gold point after execution is required'],
    },
    message: {
      type: String,
      default: 'Shared by Admin',
    },
  },
  {
    timestamps: true,
  }
);
gpTriggerExecHistorySchema.plugin(toJSON);
gpTriggerExecHistorySchema.plugin(paginate);

/**
 * @typedef GPExecHistory
 */
const GPExecHistory = mongoose.model('GPExecHistory', gpTriggerExecHistorySchema);

module.exports = GPExecHistory;

const mongoose = require('mongoose');
const validator = require('validator');
const { paginate, toJSON } = require('../../models/plugins');

const goldPointTriggerSingleSchema = new mongoose.Schema(
  {
    totalGoldPoint: Number,
    status: {
      type: String,
      enum: ['success', 'failed'],
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
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
// goldPointTriggerSingleSchema.plugin(toJSON);
goldPointTriggerSingleSchema.plugin(paginate);

/**
 * @typedef GoldPointTriggerSingle
 */
const GoldPointTriggerSingle = mongoose.model('GoldPointTriggerSingle', goldPointTriggerSingleSchema);

module.exports = GoldPointTriggerSingle;

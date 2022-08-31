const mongoose = require('mongoose');
const validator = require('validator');
const { paginate, toJSON } = require('../../models/plugins');

const goldPointTriggerSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      enum: ['EAGLE', 'SNOW'],
    },
    executionDate: String,
    gpPerToken: String,
    totalGP: Number,
    numberOfUsers: Number,
    status: {
      type: String,
      enum: ['success', 'pending', 'failed'],
      default: 'pending',
    },
    minute: {
      type: Number,
    },
    hour: {
      type: Number,
    },
    day: {
      type: Number,
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
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
  },
  {
    timestamps: true,
  }
);
goldPointTriggerSchema.plugin(toJSON);
goldPointTriggerSchema.plugin(paginate);

/**
 * @typedef GoldPointTrigger
 */
const GoldPointTrigger = mongoose.model('GoldPointTrigger', goldPointTriggerSchema);

module.exports = GoldPointTrigger;

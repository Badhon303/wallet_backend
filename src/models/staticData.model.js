const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const staticDataSchema = new mongoose.Schema(
  {
    refPointDollarPrice: {
      type: Number,
      default: 0,
    },
    goldPointDollarPrice: {
      type: Number,
      default: 0,
    },
    goldPointWeight: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
staticDataSchema.plugin(toJSON);
staticDataSchema.plugin(paginate);

/**
 * @typedef StaticData
 */
const StaticData = mongoose.model('StaticData', staticDataSchema);

module.exports = StaticData;

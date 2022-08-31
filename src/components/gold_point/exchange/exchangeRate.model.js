const mongoose = require('mongoose');
const { paginate, toJSON } = require('../../../models/plugins');

const gpExchangeRateSchema = new mongoose.Schema(
  {
    coin: {
      type: String,
      enum: ['WOLF', 'EAGLE', 'SNOW', 'BTC', 'ETH'],
    },
    bonus: {
      type: Number,
      default: 0,
    },
    unit: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Enabled', 'Disabled'],
      default: 'Disabled',
    },
  },
  {
    timestamps: true,
  }
);

gpExchangeRateSchema.plugin(toJSON);
gpExchangeRateSchema.plugin(paginate);

/**
 * @typedef GPExchangeRate
 */
const GPExchangeRate = mongoose.model('GPExchangeRate', gpExchangeRateSchema);

module.exports = GPExchangeRate;

const mongoose = require('mongoose');
const { paginate, toJSON } = require('../../models/plugins');

const goldPointSchema = new mongoose.Schema(
  {
    totalPoint: {
      type: Number,
      default: 0.0,
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
goldPointSchema.plugin(toJSON);
goldPointSchema.plugin(paginate);

/**
 * @typedef GoldPoint
 */
const GoldPoint = mongoose.model('GoldPoint', goldPointSchema);

module.exports = GoldPoint;

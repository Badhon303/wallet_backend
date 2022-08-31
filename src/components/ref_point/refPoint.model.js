const mongoose = require('mongoose');
const { paginate, toJSON } = require('../../models/plugins');

const refPointSchema = new mongoose.Schema(
  {
    totalPoint: { type: Number, default: 0.0 },
    user: { type: mongoose.Types.ObjectId, ref: 'User', unique: [true, 'User must be unique'], sparse: true },
  },
  {
    timestamps: true,
  }
);
refPointSchema.plugin(toJSON);
refPointSchema.plugin(paginate);

/**
 * @typedef RefPoint
 */
const RefPoint = mongoose.model('RefPoint', refPointSchema);

module.exports = RefPoint;

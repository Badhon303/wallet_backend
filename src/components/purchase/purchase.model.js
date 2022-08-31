const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const purchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: {
      type: String,
      unique: [true, 'OrderId must be unique.'],
      required: [true, 'OrderId is required'],
      sparse: true,
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

purchaseSchema.plugin(toJSON);
purchaseSchema.plugin(paginate);

/**
 * @typedef Purchase
 */
const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;

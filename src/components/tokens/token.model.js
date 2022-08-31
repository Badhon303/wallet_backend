const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const tokenSchema = new mongoose.Schema(
  {
    tokenName: {
      type: String,
      enum: ['WOLF,', 'EAGLE', 'SNOW'],
      unique: true,
      required: true,
    },
    unitValue: {
      type: Number,
      required: true,
    },
    unitPriceInDollar: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tokenSchema.plugin(toJSON);
tokenSchema.plugin(paginate);

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;

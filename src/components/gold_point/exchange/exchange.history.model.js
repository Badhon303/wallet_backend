const mongoose = require('mongoose');
const validator = require('validator');
const { paginate } = require('../../../models/plugins');

const gpTxHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    txId: {
      type: String,
      unique: [true, 'Transaction Id must be unique.'],
      required: [true, 'Transaction Id is required'],
      sparse: true,
    },
    goldPointAmount: {
      type: Number,
      required: [true, 'Gold Point is required'],
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    coin: {
      type: String,
      enum: ['WOLF', 'EAGLE', 'SNOW', 'ETH', 'BTC'],
      required: [true, 'coin is required'],
    },
    toAddress: {
      type: String,
      required: [true, 'to address is required'],
    },
    coinAmount: {
      type: Number,
      required: [true, 'coinAmount is required'],
    },
    unit: {
      type: Number,
      required: [true, 'Unit is required'],
    },
    bonusAmount: {
      type: Number,
      required: [true, 'bonusAmount is required'],
    },
    totalCoinAmount: {
      type: Number,
      required: [true, 'totalCoinAmount is required'],
    },
    status: {
      type: Boolean,
      required: [true, 'status is required'],
    },
    gpBeforeTx: {
      type: Number,
      required: [true, 'gold point before transaction is required'],
    },
    gpAfterTx: {
      type: Number,
      required: [true, 'Gold point after transaction is required'],
    },
    message: {
      type: String,
      default: 'Exchanged for Coin',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
  },
  { timestamps: true }
);

// gpTxHistorySchema.plugin(toJSON);
gpTxHistorySchema.plugin(paginate);

/**
 * @typedef GPTxHistory
 */
const GPTxHistory = mongoose.model('GPTxHistory', gpTxHistorySchema);

module.exports = GPTxHistory;

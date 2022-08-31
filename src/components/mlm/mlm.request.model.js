const mongoose = require('mongoose');

const mlmRequests = new mongoose.Schema(
  {
    role: { type: String, enum: ['admin', 'user'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    requestedTime: { type: Date, required: true },
  },
  { timestamps: true }
);

/**
 * @typedef MlmRequest
 */
const MlmRequest = mongoose.model('MlmRequest', mlmRequests);

module.exports = MlmRequest;

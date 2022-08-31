const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const emailSchema = mongoose.Schema(
  {
    resetPasswordSubject: {
      type: String,
      trim: true,
    },
    resetPasswordText: {
      type: String,
      trim: true,
    },
    sendApprovalRequestToAdminSubject: {
      type: String,
      trim: true,
    },
    sendApprovalRequestToAdminText: {
      type: String,
      trim: true,
    },
    notifyUserAfterRequestSubject: {
      type: String,
      trim: true,
    },
    notifyUserAfterRequestText: {
      type: String,
      trim: true,
    },
    notifyAdminAfterActionSubject: {
      type: String,
      trim: true,
    },
    notifyAdminAfterActionText: {
      type: String,
      trim: true,
    },
    notifyAdminOnStatusChangeSubject: {
      type: String,
      trim: true,
    },
    notifyAdminOnStatusChangeText: {
      type: String,
      trim: true,
    },
    notifyUserAfterActionSubject: {
      type: String,
      trim: true,
    },
    notifyUserAfterActionText: {
      type: String,
      trim: true,
    },
    notifyAdminOnUserRegistrationSubject: {
      type: String,
      trim: true,
    },
    notifyAdminOnUserRegistrationText: {
      type: String,
      trim: true,
    },
    notifyUserOnRegistrationSubject: {
      type: String,
      trim: true,
    },
    notifyUserOnRegistrationText: {
      type: String,
      trim: true,
    },
    sendShareProfileEmailSubject: {
      type: String,
      trim: true,
    },
    sendShareProfileEmailText: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
emailSchema.plugin(toJSON);
emailSchema.plugin(paginate);

/**
 * @typedef Email
 */
const Email = mongoose.model('Email', emailSchema);

module.exports = Email;

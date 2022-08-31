const mongoose = require('mongoose');
// const { toJSON, paginate } = require('../../models/plugins');

const emailTempleteSchema = new mongoose.Schema({
  description: String,
  title: {
    type: String,
    required: [true, 'Subject is required'],
  },
  category: {
    type: String,
    enum: ['Registration', 'Referrence', 'Reset_Password', 'Approval', 'Approval_Performed', 'Share_Profile', 'User_Status'],
    required: true,
  },
  aimTo: {
    type: String,
    enum: ['User', 'Admin', 'Referrer'],
    required: true,
  },
  greetings: String,
  body: {
    type: String,
    //required: [true, 'Body is required'],
  },
  closing: String,
  signature: {
    type: String,
    default: `<br/><strong>Thank you</strong> <br/>Wes-wallet Team`,
  },
});

/**
 * @typedef EmailTemplate
 */
const EmailTemplate = mongoose.model('EmailTemplate', emailTempleteSchema);

module.exports = EmailTemplate;

const nodemailer = require('nodemailer');
const httpStatus = require('http-status');
const config = require('../config/config');

const { emailTemplateService } = require('../components/email');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info(`Connected to email server`))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, html: text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  // eslint-disable-next-line no-unused-vars
  const baseUrl = config.server.url;

  const resetPasswordUrl = `${baseUrl}/reset-password?token=${token}`;

  const template = await emailTemplateService.getByCategoryAndAimTo('Reset_Password', 'User');
  if (!template) throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about reset password.`);

  const subject = template.title;
  const text = eval('`' + template.body + '<br/>' + template.signature + '`');

  await sendEmail(to, subject, text);
};

/**
 * Send document approval request to admin
 * @param {string} to
 * @param {string} requestDescription
 * @returns {Promise}
 */
const sendApprovalRequestToAdmin = async (to, userNickName) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('Approval', 'Admin');
  if (!template) throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about approval request to admin.`);

  const subject = template.title;
  const text = eval('`' + template.body + '<br/>' + template.signature + '`');
  await sendEmail(to, subject, text);
};

/**
 * Send email to user after sending approval request
 * @param {string} to
 * @param {string} requestDescription
 * @returns {Promise}
 */
const notifyUserAfterRequest = async (to, userNickName) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('Approval', 'User');
  if (!template)
    throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about notify user after approval request.`);

  const subject = template.title;
  const text = eval('`' + template.body + '<br/>' + template.signature + '`');

  await sendEmail(to, subject, text);
};

/**
 * Send email to admin after approving or rejecting documents
 * @param {string} adminEmail
 * @param {string} requestDescription
 * @returns {Promise}
 */
const notifyAdminAfterAction = async (approvalStatus, userNickName) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('Approval_Performed', 'Admin');
  if (!template)
    throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about notify Admin after approval performed.`);

  const subject = template.title;
  const status = approvalStatus ? 'approved' : 'rejected';
  const { adminName } = config.email;

  const text = eval('`' + template.body + '<br/>' + template.signature + '`');
  await sendEmail(config.email.adminEmail, subject, text);
};

/**
 * Send email to user after approving or rejecting documents
 * @param {string} to
 * @param {string} requestDescription
 * @param {string} userNickName
 * @param {string} customMessageToSend
 * @returns {Promise}
 */
const notifyUserAfterAction = async (to, approvalStatus, userNickName) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('Approval_Performed', 'User');
  if (!template)
    throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about notify User after approval performed.`);

  const subject = template.title;
  const status = approvalStatus ? 'approved' : 'rejected';
  const text = eval('`' + template.body + '<br/>' + template.signature + '`');

  await sendEmail(to, subject, text);
};

/**
 * Send email to admin after a user registers
 * @param {string} to
 * @returns {Promise}
 */
const notifyAdminOnUserRegistration = async (userEmail, userNickName) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('Registration', 'Admin');
  if (!template)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Email template does not exists about notify Admin about new user registration.`
    );

  const subject = template.title;
  const { adminName } = config.email;

  const text = eval('`' + template.body + '<br/>' + template.signature + '`');
  await sendEmail(config.email.adminEmail, subject, text);
};

/**
 * Send email to admin after a user registers
 * @param {string} userEmail
 * @param {string} userNickName
 * @returns {Promise}
 */
const notifyUserOnRegistration = async (userEmail, userNickName, introducerName) => {
  const userTemplate = await emailTemplateService.getByCategoryAndAimTo('Registration', 'User');
  if (!userTemplate)
    throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about notify User about registration.`);

  const subject = userTemplate.title;
  const text = eval('`' + userTemplate.body + '<br/>' + userTemplate.signature + '`');

  await sendEmail(userEmail, subject, text);

  //   if (introducerName) {
  //     text = `Congratulations!!!

  // Dear ${userNickName},
  // You have successfully registered to WES Wallet under the reference of ${introducerName}. Please login to the system and update profile information at
  // https://wes-wallet.com/signin`;
  //   } else {
  //     text = `Congratulations!!!

  // Dear ${userNickName},
  // You have successfully registered to WES Wallet. Please login to the system and update profile information at
  // https://wes-wallet.com/signin`;
  //   }

  //   await sendEmail(userEmail, subject, text);
};

/**
 * Send email to admin after a user registers
 * @param {string} introducerEmail
 * @param {string} introducerName
 * @param {string} userNickName
 * @returns {Promise}
 */
const notifyIntroducerOnRegistration = async (introducerEmail, introducerName, userNickName) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('Registration', 'Referrer');
  if (!template)
    throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about notify Introducer about registration.`);

  const subject = template.title;
  const text = eval('`' + template.body + '<br/>' + template.signature + '`');

  await sendEmail(introducerEmail, subject, text);
};

const sendShareProfileEmail = async (to, sender, url) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('Share_Profile', 'User');
  if (!template) throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about referrers sharing profile.`);

  const subject = template.title;
  const text = eval('`' + template.body + '<br/>' + template.signature + '`');

  await sendEmail(to, subject, text);
};

const notifyAdminOnStatusChange = async (userEmail, userNickName, userStatus) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('User_Status', 'Admin');
  if (!template) throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about changing user status.`);

  const subject = template.title;
  const { adminName } = config.email;
  const status = userStatus ? 'activated' : 'deactivated';
  const text = eval('`' + template.body + '<br/>' + template.signature + '`');
  //await sendEmail(to, subject, text);
};

const sendVerificationEmailOnRegistration = async (userEmail, nickName, link) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('Email_Verification', 'User');
  if (!template)
    throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about email verification on registration.`);

  const subject = template.title;
  const text = eval('`' + template.body + '<br/>' + template.signature + '`');
  await sendEmail(userEmail, subject, text);
  // const subject = `Verify your email address.`;
  // const text = `Dear ${nickName} <br />
  //   <div>
  //     <p>We have noticed that you have registered to wes wallet. Please click <a href="${link}"><strong>here</strong></a>  to verify your email address.</p>
  //     <p>Regards</P>
  //     <p><strong> WES-wallet team</strong></p>
  //   </div>
  //     `;
};

const sendOtp = async (userEmail, userNickName, otp) => {
  const template = await emailTemplateService.getByCategoryAndAimTo('OTP', 'User');
  if (!template) throw new ApiError(httpStatus.NOT_FOUND, `Email template does not exists about otp on login.`);

  const subject = template.title;
  const text = eval('`' + template.body + '<br/>' + template.signature + '`');
  await sendEmail(userEmail, subject, text);

  // const subject = 'WES Wallet Login OTP';

  // const text = `Dear ${userNickName}, <br />

  // An attempt to acces your WES Wallet account has been made
  // Please use the following OTP to access your account <br/>
  // One Time Password: <b> ${otp} </b>
  // <br/>
  // Regards, <br/>
  // WES Wallet Team`;
  // await sendEmail(userEmail, subject, text);
};

module.exports = {
  sendOtp,
  transport,
  sendEmail,
  notifyUserAfterAction,
  sendShareProfileEmail,
  sendResetPasswordEmail,
  notifyUserAfterRequest,
  notifyAdminAfterAction,
  notifyUserOnRegistration,
  notifyAdminOnStatusChange,
  sendApprovalRequestToAdmin,
  notifyAdminOnUserRegistration,
  notifyIntroducerOnRegistration,
  sendVerificationEmailOnRegistration,
};

const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { mlmService } = require('../components/mlm');
const config = require('../config/config');
const { ethServices } = require('../components/eth');
const { btcServices } = require('../components/btc');

const register = catchAsync(async (req, res) => {
  /**
   * Before Email verification
   */

  // const { email, nickName, password } = req.body;
  // let { referrerId } = req.query;
  // if (!referrerId) {
  //   referrerId = config.shareable.referrerId;
  // }
  // const user = await userService.createUser({ email, nickName, password });
  // await mlmService.addById(user.id, referrerId);
  // const referrer = await mlmService.getReferrer(user.id);
  // const ethAccount = await ethServices.create(user.id);
  // const btcAccount = await btcServices.create(user.id);
  // const tokens = await tokenService.generateAuthTokens(user);

  // const result = await userService.constructRegisterResponse(user, ethAccount, btcAccount, referrer, tokens);

  // if (referrer.email) {
  //   await emailService.notifyUserOnRegistration(user.email, user.nickName, referrer.nickName);
  // } else {
  //   await emailService.notifyUserOnRegistration(user.email, user.nickName);
  // }
  // await emailService.notifyAdminOnUserRegistration(user.email, user.nickName);
  // if (referrer.email) {
  //   await emailService.notifyIntroducerOnRegistration(referrer.email, referrer.nickName, user.nickName);
  // }
  // res.status(httpStatus.CREATED).send({ result });

  /**
   * Email verification starts here
   */

  const { email, nickName, password, termsOfUse } = req.body;
  let { referrerId } = req.query;
  if (!referrerId) {
    referrerId = config.shareable.referrerId;
  }
  const user = await userService.createUser({ email, nickName, password, termsOfUse, emailVerified: false });
  await mlmService.addById(user.id, referrerId);
  const referrer = await mlmService.getReferrer(user.id);
  // const ethAccount = await ethServices.create(user.id);
  // const btcAccount = await btcServices.create(user.id);
  // const tokens = await tokenService.generateAuthTokens(user);

  if (referrer.email) {
    await emailService.notifyUserOnRegistration(user.email, user.nickName, referrer.nickName);
  } else {
    await emailService.notifyUserOnRegistration(user.email, user.nickName);
  }
  await emailService.notifyAdminOnUserRegistration(user.email, user.nickName);
  if (referrer.email) {
    await emailService.notifyIntroducerOnRegistration(referrer.email, referrer.nickName, user.nickName);
  }

  const message = await authService.postRegistration(email, nickName);
  // const result = await userService.constructRegisterResponse(user, ethAccount, btcAccount, referrer, tokens, message);
  // const result = await userService.constructRegisterResponse(ethAccount, btcAccount, message);
  const result = await userService.constructRegisterResponse(message);

  res.status(httpStatus.CREATED).send(result);
});

const verifyEmail = catchAsync(async (req, res) => {
  const { jwt } = req.body;
  const registrationData = await authService.onEmailVerification(jwt);
  const createdAddress = await authService.createBlockchainAccounts(registrationData.user.email);

  await ethServices.storeAddress(registrationData.user.id, createdAddress.result[1].address);
  await btcServices.storeAddress(registrationData.user.id, createdAddress.result[0].address);

  res.status(httpStatus.OK).json({ registrationData });
});

const preregister = catchAsync(async (req, res) => {
  const { email, nickName, password } = req.body;

  let { referrerId } = req.query;
  if (!referrerId) referrerId = config.shareable.referrerId;

  const message = await authService.preRegistration(email, nickName, password, referrerId);
  return res.status(httpStatus.CREATED).json({ message });
});

const login = catchAsync(async (req, res) => {
  // const { email, password } = req.body;
  // const user = await authService.loginUserWithEmailAndPassword(email, password);
  // const tokens = await tokenService.generateAuthTokens(user);
  // res.send({ user, tokens });

  const { email, password } = req.body;
  const otpStatus = await authService.loginUserWithEmailAndPassword(email, password);

  return res.status(httpStatus.OK).json(otpStatus);
});

const matchOTP = catchAsync(async (req, res) => {
  const { otp, email } = req.body;

  const matchStatus = await authService.matchOTP(email, otp);

  const { user, tokens } = matchStatus;

  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.OK).json({
    success: true,
    message: `An email has been sent to ${req.body.email} address`,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password Reset Successful',
  });
});

const createBlockchainAccount = catchAsync(async (req, res) => {
  const userEmail = req.user.email;
  const createdAddress = await authService.createBlockchainAccounts(userEmail);

  await ethServices.storeAddress(req.user._id, createdAddress.result[1].address);
  await btcServices.storeAddress(req.user._id, createdAddress.result[0].address);

  res.send(createdAddress);
});

module.exports = {
  login,
  logout,
  register,
  verifyEmail,
  preregister,
  refreshTokens,
  resetPassword,
  forgotPassword,
  matchOTP,
  createBlockchainAccount,
};

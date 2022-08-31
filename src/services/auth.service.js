const httpStatus = require('http-status');
const otpGenerator = require('otp-generator');
const axios = require('axios');
const redis = require('../utils/redis');
const userService = require('./user.service');
const tokenService = require('./token.service');
const emailService = require('./email.service');

const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Token } = require('../models');
const config = require('../config/config');
const { encryptIpAddress } = require('../utils/crypto');

const generateOtp = async (email) => {
  const otp = otpGenerator.generate(6, { upperCase: true, specialChars: true });

  await redis.setData(email, otp);

  return otp;
  // return { message: 'An OTP has been sent to your email.', status: httpStatus.OK };
};

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  if (!user.emailVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, `Please, verify your email address first.`);
  }

  // const otpStatus = await generateOtp(email);
  // return otpStatus;

  const otp = await generateOtp(email);
  await emailService.sendOtp(user.email, user.nickName, otp);

  if (otp) {
    const responseObj = {
      status: httpStatus.OK,
      message: 'An OTP has been sent to your email address',
    };
    return responseObj;
  }
  // constructRegisterResponse;
  return 'Failed to generate OTP';
};

const matchOTP = async (email, requestOTP) => {
  const cachedOTP = await redis.getData(email);
  if (!cachedOTP) throw new ApiError(httpStatus.NOT_FOUND, 'OTP expired');

  const user = await userService.getUserByEmail(email);

  if (cachedOTP === requestOTP) {
    redis.removeOTP(email);
    const tokens = await tokenService.generateAuthTokens(user);
    return { tokens, user };
  }
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

const postRegistration = async (email, nickName) => {
  const expirationToken = await tokenService.generateEmailVerificationToken(email, nickName);
  const link = `${config.server.url}/email-verification/${expirationToken.token}`;

  // const registrationObj = new Registration({ email, nickName, password, referrer, expiaryTime });
  // await registrationObj.save();

  // userService.createUser({ email, nickName, password, emailVerified: false });

  await emailService.sendVerificationEmailOnRegistration(email, nickName, link);

  return `A verification email has been sent to your email address. Account will be created after the verification completed.`;
};

const onEmailVerification = async (jwtToken) => {
  const payload = await tokenService.verifyEmailVerificationToken(jwtToken);
  return userService.verifyEmail(payload.email);
};

const createBlockchainAccounts = async (userEmail) => {
  const apiEndpoint = `/api/create-wallet`;
  const url = config.blockchainApi.url + apiEndpoint;
  try {
    const response = await axios.post(
      url,
      { user: userEmail },
      {
        headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
      }
    );

    if (!response) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to create blockchain account`);
    }

    return response.data;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

module.exports = {
  logout,
  refreshAuth,
  resetPassword,
  postRegistration,
  onEmailVerification,
  loginUserWithEmailAndPassword,
  matchOTP,
  createBlockchainAccounts,
};

const fs = require('fs');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const { User } = require('../models');

//const ethService = require('../components/eth/eth-account.service');

const otpservice = require('../utils/otp');
const config = require('../config/config');
const emailService = require('./email.service');

const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (!userBody.termsOfUse) {
    throw new ApiError(httpStatus.CONFLICT, `You must agree with our terms of use.`);
  }

  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  if (userBody.nickName) {
    // eslint-disable-next-line no-param-reassign
    userBody.nickName = userBody.nickName.charAt(0).toUpperCase() + userBody.nickName.slice(1).toLowerCase();
  }

  const user = await User.create(userBody);

  return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

const getUsersForGP = async () => {
  const users = await User.find().select('_id');
  return users;
};

/**
 * List the users with approvalStatus 'False'
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const pendingUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  if (id !== null) {
    const user = await User.findById(id).select('-password');
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist.');
    return user;
  }
};

const getMlmUser = async (id) => {
  const user = await User.findById(id).select('firstName lastName middleName nickName email');
  if (!user) return null;
  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  const user = User.findOne({ email });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'No user found with the email address');
  return user;
};

/**
 * Get email by userId
 * @param {ObjectId} userId
 * @returns {email}
 */
const getEmailByUserId = async (userId) => {
  const user = User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user.email;
};

/**
 * get reffer by referrerId
 * @param {ObjectId} referrerId
 * @returns {Promise<Object>}
 */
const getReferrer = async (referrerId) => {
  const referrer = await User.findById(referrerId).select('email nickName');
  return referrer;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  if (updateBody.nationalId === '') {
    delete updateBody.nationalId;
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();

  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Delete file by path
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteFileByPath = async (userId, photoType) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  switch (photoType) {
    case 'profile-photo':
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (fs.existsSync(`./src/public/uploads/${user.photo}`)) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlinkSync(`./src/public/uploads/${user.photo}`);
      }
      break;

    case 'nid-photo':
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (fs.existsSync(`./src/public/uploads/${user.nidFront}`)) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlinkSync(`./src/public/uploads/${user.nidFront}`);
      }
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (fs.existsSync(`./src/public/uploads/${user.nidBack}`)) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlinkSync(`./src/public/uploads/${user.nidBack}`);
      }
      break;

    case 'passport-photo':
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (fs.existsSync(`./src/public/uploads/${user.passportBiodata}`)) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlinkSync(`./src/public/uploads/${user.passportBiodata}`);
      }
      break;
    default:
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (fs.existsSync(`./src/public/uploads/${user.drivingFront}`)) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlinkSync(`./src/public/uploads/${user.drivingFront}`);
      }
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (fs.existsSync(`./src/public/uploads/${user.drivingBack}`)) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlinkSync(`./src/public/uploads/${user.drivingBack}`);
      }
  }
};

/**
 * Change password
 * @param {string} newPassword
 * @returns {Promise}
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }

    const passWordIsMatch = await bcrypt.compare(oldPassword, user.password);

    if (passWordIsMatch) {
      const response = await updateUserById(user.id, { password: newPassword });
      if (!response) throw new ApiError(httpStatus.BAD_REQUEST, 'Could not update password');

      return response;
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old password did not match');
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Wrong password');
  }
};

/**
 * Returns a shareable link or sends
 * email containing shareable link
 * @param {ObjectId} userId
 * @param {Boolean} medium
 * @param {Email} email
 * @returns {URL || String}
 */
const share = async (userId, medium, email = 0) => {
  const url = new URL(config.shareable.baseUrl);
  const shouldReturnAnURL = medium === config.shareable.QR || medium === config.shareable.LINK;
  const user = await User.findById(userId).select('firstName lastName middleName nickName email');
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist.');
  const shareableData = await user.getShareableData();

  Object.keys(shareableData).forEach((key) => {
    const value = shareableData[key];
    url.searchParams.append(key, value);
  });

  if (shouldReturnAnURL) {
    url.searchParams.append('medium', medium);
    return url;
  }

  await emailService.sendShareProfileEmail(email, user.nickNake, url);
  return 'Email sent successfully!';
};

/**
 * Previous method
 */
// const constructRegisterResponse = async (user, ethAccount, btcAccount, referrer, tokens, message) => {
//   const result = {};
//   result.user = user;
//   result.ethAccount = ethAccount;
//   result.btcAccount = btcAccount;
//   if (referrer) result.referrer = referrer;
//   result.tokens = tokens;
//   result.message = message;

//   return result;
// };

/**
 * New method
 */
const constructRegisterResponse = async (ethAccount, btcAccount, message) => {
  const result = {};
  result.ethAccount = ethAccount;
  result.btcAccount = btcAccount;
  result.message = message;

  return result;
};

const constructMeResponse = async (user, ethAccount, btcAccount) => {
  const result = {};
  const newUser = { ...user };

  if (ethAccount) newUser.ethAccount = ethAccount;
  if (btcAccount) newUser.btcAccount = btcAccount;

  result.user = newUser._doc;
  result.user.ethAccount = newUser.ethAccount;
  result.user.btcAccount = newUser.btcAccount;
  return result;
};

const hasValidApprovalStatus = async (userId) => {
  const user = await getUserById(userId);
  return user.approvalStatus === 'approved';
};

const eliminateAdminAccount = async (users) => {
  for (let i = 0; i < users.length; i += 1) {
    const singleUser = await getUserById(users[i].user);
    if (singleUser.role === 'admin') {
      users.splice(i, 1);
    }
  }
  return users;
};

const getUserDetails = async (users) => {
  const newUsers = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = await User.findById(users[i].user).select('email nickName firstName lastName middleName');
    const completeObj = {
      id: users[i]._id,
      user: {
        id: user._id,
        nickName: user.nickName,
        email: user.email,
        fullName:
          (user.lastName ? `${user.lastName} ` : '') +
          (user.firstName ? `${user.firstName} ` : '') +
          (user.middleName ? user.middleName : ''),
      },
      trigger: users[i].trigger,
      goldPointBeforeTrigger: users[i].goldPointBeforeTrigger,
      receivedGoldPointAmount: users[i].receivedGoldPointAmount,
      goldPointAfterTrigger: users[i].goldPointAfterTrigger,
      createdAt: users[i].createdAt,
      updatedAt: users[i].updatedAt,
    };
    newUsers.push(completeObj);
  }
  return newUsers;
};

const bindUserInfo = async (user) => {
  const userObj = await User.findById(user.user);
  const purchaseDetails = {
    message: user.message,
    id: user._id,
    txId: user.txId,
    status: user.status,
    gpBeforeTx: user.gpBeforeTx,
    gpAfterTx: user.gpAfterTx,
    coin: user.coin,
    price: user.price,
    toAddress: user.toAddress,
    coinAmount: user.coinAmount,
    bonusAmount: user.bonusAmount,
    totalCoinAmount: user.totalCoinAmount,
    goldPointAmount: user.goldPointAmount,
    unit: user.unit,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    user: {
      userId: userObj._id,
      nickName: userObj.nickName,
      email: userObj.email,
      fullName:
        (userObj.lastName ? `${userObj.lastName} ` : '') +
        (userObj.firstName ? `${userObj.firstName} ` : '') +
        (userObj.middleName ? userObj.middleName : ''),
    },
  };
  return purchaseDetails;
};

const getUserDetailsForSingleUser = async (users) => {
  const newUsers = [];
  for (let i = 0; i < users.results.length; i += 1) {
    const user = await getUserByEmail(users.results[i].userEmail);

    const completeUserObj = {
      triggerId: users.results[i]._id,
      totalGoldPoint: users.results[i].totalGoldPoint,
      status: users.results[i].status,
      user: {
        nickName: user.nickName,
        email: user.email,
        fullName:
          (user.lastName ? `${user.lastName} ` : '') +
          (user.firstName ? `${user.firstName} ` : '') +
          (user.middleName ? user.middleName : ''),
      },
      executionDate: users.results[i].updatedAt,
    };
    newUsers.push(completeUserObj);
  }
  users.results = newUsers;
  return users;
};

const getTotalUsersWithDifferentStatus = async () => {
  const totalUsers = {
    approved: await User.countDocuments({ approvalStatus: 'approved' }).exec(),
    pending: await User.countDocuments({ approvalStatus: 'pending' }).exec(),
    rejected: await User.countDocuments({ approvalStatus: 'rejected' }).exec(),
    unApplied: await User.countDocuments({ approvalStatus: 'unapplied' }).exec(),
  };
  return totalUsers;
};

const verifyEmail = async (email) => {
  const user = await User.findOneAndUpdate({ email }, { emailVerified: true }, { new: true });
  return {
    message: `Email verified successfully.`,
    user: {
      id: user._id,
      email: user.email,
      nickName: user.nickName,
      emailVerified: user.emailVerified,
    },
  };
};

const getOtp = async (email, nickName) => {
  const otp = await otpservice.generateOtp(email);
  await emailService.sendOtp(email, nickName, otp);

  if (otp) {
    return {
      status: httpStatus.OK,
      message: 'An OTP has been sent to your email address',
    };
  }

  return {
    status: httpStatus.INTERNAL_SERVER_ERROR,
    message: 'Failed to generate OTP',
  };
};

/**
const checkIfUserHasTokenBeforeDelete = async (userId) => {
  let wolf = await ethService.getTokenBalanceByUserId(userId, 'WOLF', 'erc20');
  let eagle = await ethService.getTokenBalanceByUserId(userId, 'EAGLE', 'erc20');
  let snow = await ethService.getTokenBalanceByUserId(userId, 'SNOW', 'erc20');

  if (wolf && wolf.result.balance > 0) {
    wolf = wolf.result.balance;
  } else {
    wolf = 0;
  }

  if (eagle && eagle.result.balance > 0) {
    eagle = eagle.result.balance;
  } else {
    eagle = 0;
  }

  if (snow && snow.result.balance > 0) {
    snow = snow.result.balance;
  } else {
    snow = 0;
  }

  if (wolf || eagle || snow) {
    return true;
  }

  return false;
};

 */

module.exports = {
  share,
  getOtp,
  createUser,
  queryUsers,
  getMlmUser,
  verifyEmail,
  getUserById,
  getReferrer,
  bindUserInfo,
  pendingUsers,
  getUsersForGP,
  updateUserById,
  getUserByEmail,
  deleteUserById,
  changePassword,
  getUserDetails,
  getEmailByUserId,
  deleteFileByPath,
  constructMeResponse,
  eliminateAdminAccount,
  hasValidApprovalStatus,
  constructRegisterResponse,
  getUserDetailsForSingleUser,
  //checkIfUserHasTokenBeforeDelete,
  getTotalUsersWithDifferentStatus,
};

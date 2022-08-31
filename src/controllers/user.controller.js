const httpStatus = require('http-status');
const pick = require('../utils/pick');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const { btcServices } = require('../components/btc');
const { ethServices } = require('../components/eth');
const { userService, emailService, authService } = require('../services');
const { mlmService } = require('../components/mlm');
const { goldPointService } = require('../components/gold_point');

const createUser = catchAsync(async (req, res) => {
  // eslint-disable-next-line prefer-const
  const { referrerId } = config.shareable;
  const user = await userService.createUser(req.body);
  // const ethAccount = await ethServices.create(user.id);
  // const btcAccount = await btcServices.create(user.id);

  const userEmail = user.email;
  const createdAddress = await authService.createBlockchainAccounts(userEmail);

  await ethServices.storeAddress(req.user._id, createdAddress.result[1].address);
  await btcServices.storeAddress(req.user._id, createdAddress.result[0].address);

  await mlmService.addById(user.id, referrerId);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Registration Successful',
    data: { user, createdAddress },
  });
});

const getmodifiedUsers = async (users) => {
  const modifiedUsers = await users.map(async (user) => ({
    user,
    ethAccount: await ethServices.getByUserId(user._id, true),
    btcAccount: await btcServices.getBtcAccountsByUserId(user._id, true),
    introducer: await mlmService.getIntroducer(user._id),
  }));

  return Promise.all(modifiedUsers);
};

const getUsers = catchAsync(async (req, res) => {
  const { email, name, approvalStatus, role } = req.query;
  const filter = {};
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  if (email) filter.email = email;
  if (name) {
    filter.nickName = req.query.name.charAt(0).toUpperCase() + req.query.name.slice(1).toLowerCase();
  }
  if (role) filter.role = role;

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const users = await userService.queryUsers(filter, options);
  users.results = await getmodifiedUsers(users.results);
  return res.status(httpStatus.OK).send(users);
});

const getTotalUsersWithDifferentStatus = catchAsync(async (req, res) => {
  const totalUsers = await userService.getTotalUsersWithDifferentStatus();
  return res.status(httpStatus.OK).json({ totalUsers });
});

const getUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  const ethAccount = await ethServices.getByUserId(userId, true);
  const btcAccount = await btcServices.getBtcAccountsByUserId(userId, true);
  const introducer = await mlmService.getIntroducerForMeRoute(userId);
  // const result = await userService.constructMeResponse(user, ethAccount, btcAccount);
  res.status(httpStatus.OK).json({ user, ethAccount, btcAccount, introducer });
});

const updateUser = catchAsync(async (req, res) => {
  req.body.approvalStatus = 'pending';
  const updatedUser = await userService.updateUserById(req.params.userId, req.body);

  if (!updatedUser) {
    throw new ApiError(httpStatus.NO_CONTENT, 'Failed to update profile');
  }

  await emailService.sendApprovalRequestToAdmin(config.email.adminEmail, updatedUser.nickName);
  await emailService.notifyUserAfterRequest(updatedUser.email, updatedUser.nickName);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Updated successfully',
    data: updatedUser,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const userHasToken = await ethServices.checkIfUserHasTokenBeforeDelete(userId);

  console.log(`User has token : ${userHasToken}`);

  if (userHasToken) {
    throw new ApiError(httpStatus.METHOD_NOT_ALLOWED, 'This account cannot be deleted as it contains token');
  } else {
    await mlmService.deleteMlmObj(userId);
    await btcServices.deleteBtcAcc(userId);
    await ethServices.deleteEthAcc(userId);
    await goldPointService.deleteGPAcc(userId);
    await userService.deleteUserById(req.params.userId);
  }
  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    data: {},
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { oldPassword } = req.body;
  const { newPassword } = req.body;
  await userService.changePassword(userId, oldPassword, newPassword);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @Desc    Chnage User Status
// @Route   GET /v1/users/:userId/change-user-status
// @Access  Private (Admin)
const changeUserStatus = catchAsync(async (req, res) => {
  const { userStatus } = req.body;
  const user = await userService.updateUserById(req.params.userId, { userStatus });

  await emailService.notifyAdminOnStatusChange(userStatus, user.nickName);

  res.status(httpStatus.OK).json({
    success: true,
    userStatus: user.userStatus,
  });
});

// @Desc    Chnage User Status to true
// @Route   GET /v1/users/:userId/change-approval-status
// @Access  Private (Admin)
const changeApprovalStatus = catchAsync(async (req, res) => {
  const { approvalStatus } = req.body;
  const user = await userService.updateUserById(req.params.userId, { approvalStatus });

  await emailService.notifyAdminAfterAction(approvalStatus, user.nickName);
  await emailService.notifyUserAfterAction(user.email, approvalStatus, user.nickName);

  res.json({
    user: user.email,
    approved: user.approvalStatus,
  });
});

const shareProfile = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { medium } = req.query;
  const { email } = req.body;
  const shareable = await userService.share(userId, medium, email);
  res.status(httpStatus.OK).json(shareable);
});

// @Desc    Upload profile photo
// @Route   PUT /v1/users/:userId/upload-passport-photo
// @Access  Private
const uploadProfilePhoto = catchAsync(async (req, res) => {
  if (req.files.length <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No File found! Please upload a file');
  }

  const profilePhoto = req.files[0];

  await userService.deleteFileByPath(req.params.userId, 'profile-photo');

  const updatedUser = await userService.updateUserById(req.params.userId, {
    photo: profilePhoto.originalname,
  });

  if (!updatedUser) {
    throw new ApiError(httpStatus.NO_CONTENT, 'Failed to updload photo');
  }

  await emailService.sendApprovalRequestToAdmin(config.email.adminEmail, updatedUser.nickName);
  await emailService.notifyUserAfterRequest(updatedUser.email, updatedUser.nickName);

  res.status(httpStatus.OK).json({
    success: true,
    data: {
      data: profilePhoto.originalname,
    },
  });
});

// @Desc    Upload national id photo
// @Route   PUT /v1/users/:userId/upload-nid-photo
// @Access  Private
const uploadNidPhoto = catchAsync(async (req, res) => {
  if (req.files.length <= 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No File found! Please upload a file');
  }

  const nidFront = req.files[0];
  const nidBack = req.files[1];

  await userService.deleteFileByPath(req.params.userId, 'nid-photo');
  await userService.deleteFileByPath(req.params.userId, 'nid-photo');

  const updatedUser = await userService.updateUserById(req.params.userId, {
    nidFront: nidFront.originalname,
    nidBack: nidBack.originalname,
    approvalStatus: 'pending',
  });

  if (!updatedUser) {
    throw new ApiError(httpStatus.NO_CONTENT, 'Failed to updload photo');
  }

  await emailService.sendApprovalRequestToAdmin(config.email.adminEmail, updatedUser.nickName);
  await emailService.notifyUserAfterRequest(updatedUser.email, updatedUser.nickName);

  res.status(httpStatus.OK).json({
    success: true,
    data: {
      front: nidFront.originalname,
      back: nidBack.originalname,
    },
  });
});

// @Desc    Upload passport photo
// @Route   PUT /v1/users/:userId/upload-passport-photo
// @Access  Private
const uploadPassportPhoto = catchAsync(async (req, res) => {
  if (req.files.length <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No File found! Please upload a file');
  }

  const passportBiodata = req.files[0];
  await userService.deleteFileByPath(req.params.userId, 'passport-photo');

  const updatedUser = await userService.updateUserById(req.params.userId, {
    passportBiodata: passportBiodata.originalname,
    approvalStatus: 'pending',
  });

  if (!updatedUser) {
    throw new ApiError(httpStatus.NO_CONTENT, 'Failed to updload photo');
  }

  await emailService.sendApprovalRequestToAdmin(config.email.adminEmail, updatedUser.nickName);
  await emailService.notifyUserAfterRequest(updatedUser.email, updatedUser.nickName);

  res.status(httpStatus.OK).json({
    success: true,
    data: {
      data: passportBiodata.originalname,
    },
  });
});

// @Desc    Upload driving license photo
// @Route   PUT /v1/users/:userId/upload-driving-photo
// @Access  Private
const uploadDrivingLicensePhoto = catchAsync(async (req, res) => {
  if (req.files.length <= 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No File found! Please upload a file');
  }

  const drivingFront = req.files[0];
  const drivingBack = req.files[1];

  await userService.deleteFileByPath(req.params.userId, 'driving-photo');
  await userService.deleteFileByPath(req.params.userId, 'driving-photo');

  const updatedUser = await userService.updateUserById(req.params.userId, {
    drivingFront: drivingFront.originalname,
    drivingBack: drivingBack.originalname,
    approvalStatus: 'pending',
  });

  if (!updatedUser) {
    throw new ApiError(httpStatus.NO_CONTENT, 'Failed to updload photo');
  }

  await emailService.sendApprovalRequestToAdmin(config.email.adminEmail, updatedUser.nickName);
  await emailService.notifyUserAfterRequest(updatedUser.email, updatedUser.nickName);

  res.status(httpStatus.OK).json({
    success: true,
    data: {
      front_side: drivingFront.originalname,
      back_side: drivingBack.originalname,
    },
  });
});

const getOtp = catchAsync(async (req, res) => {
  const { email, nickName } = req.user;
  const result = await userService.getOtp(email, nickName);
  return res.status(httpStatus.OK).json(result);
});

module.exports = {
  getOtp,
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  shareProfile,
  uploadNidPhoto,
  changePassword,
  changeUserStatus,
  uploadProfilePhoto,
  uploadPassportPhoto,
  changeApprovalStatus,
  uploadDrivingLicensePhoto,
  getTotalUsersWithDifferentStatus,
};

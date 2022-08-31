const httpStatus = require('http-status');

const { userService } = require('../../services');
const { refPointService } = require('../ref_point');

const mlmTree = require('./mlm.tree');
const mlmConsts = require('./mlm.constants');

const Mlm = require('./mlm.model');
const MlmTree = require('./mlm.tree.model');
const MlmRequest = require('./mlm.request.model');

const config = require('../../config/config');
const ApiError = require('../../utils/ApiError');

const hasAlreadyJoined = async (userId) => {
  const mlmUser = await Mlm.findOne({ user: userId });
  return mlmUser !== undefined && mlmUser !== null;
};

/**
 * Returns a user joined in MLM system
 * @param {mongoose.Schema.Types.ObjectId} userId
 * @returns {Promise<Object>}
 * @throws {Object<ApiError>}
 */
const findByUserId = async (userId) => {
  const user = Mlm.findOne({ user: userId }).select('id user parent children');
  if (user === undefined) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User with provided id does not exist in MLM system.');
  }
  return user;
};

/**
 * adds user to the mlm tree
 * @param {mongoose.Model<Mlm>} user
 * @param {mongoose.Model<Mlm>} parent
 * @returns {Promise<Object>}
 * @throws {ApiError}
 */
const add = async (user, parent) => {
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User or parent does not exists');
  }

  if (await hasAlreadyJoined(user.id)) {
    throw new ApiError(httpStatus.CONFLICT, 'User has already joined in the MLM tree.');
  }

  const mlmUser = new Mlm({ user: user.id, parent: parent !== null ? parent.id : null, children: [] });
  const response = mlmUser.save();

  if (parent) {
    const p = await findByUserId(parent.id);
    p.children.push(user);
    p.save();
  }

  return response;
};

/**
 * Add a user to the MLM tree and
 * Set parent of the user.
 * Throws ApiError if user is not registered or
 * has already joined to the MLM tree.
 * @param {string} userEmail
 * @param {string} parentEmail
 * @returns {Promise<Object>}
 * @throws {ApiError}
 */
const addByEmail = async (userEmail, parentEmail) => {
  const user = await userService.getUserByEmail(userEmail);
  const parent = !parentEmail ? null : await userService.getUserByEmail(parentEmail);
  return add(user, parent);
};

/**
 * Adds user by id
 * @param {mongoose.Schema.Types.ObjectId} userId
 * @param {mongoose.Schema.Types.ObjectId} parentId
 * @returns {Object}
 * @throws {Object<ApiError>}
 */
const addById = async (userId, parentId) => {
  const user = await userService.getUserById(userId);
  const parent = !parentId ? null : await userService.getUserById(parentId);
  return add(user, parent);
};

const deleteMlmObj = async (userId) => {
  console.log(userId);
  await refPointService.deleteByUser(userId);
  console.log('refpointObj deleted');

  const mlmObj = await Mlm.findOne({ user: userId });
  console.log(`mlmObj = ${JSON.stringify(mlmObj)}`);

  if (!mlmObj) return true;
  console.log('mlmObj found');

  if (mlmObj.parent) {
    const parentObj = await Mlm.findOne({ user: mlmObj.parent });
    console.log(`Parent = ${JSON.stringify(parentObj)}`);

    const childIndex = parentObj.children.indexOf(mlmObj.user);
    console.log(childIndex);
    if (childIndex) parentObj.children.splice(childIndex, 1);
    await parentObj.save();
  }
  const result = await mlmObj.deleteOne({ user: userId });
  console.log(result);
  return true;
};

/**
 * fetch parentId and returns
 * @param {mongoose.Schema.Types.ObjectId} userId
 * @returns {mongoose.Schema.Types.ObjectId} parentId
 */
const findReferrerId = async (userId) => {
  if (!hasAlreadyJoined(userId)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User has not joined to MLM tree yet.');
  }

  const user = await findByUserId(userId);
  return !user || !user.parent ? null : user.parent;
};

/**
 * Fetch referrer
 * @param {ObjectId} userId
 * @returns {ObjectId} referrerId
 */
const getReferrer = async (userId) => {
  const referrerId = await findReferrerId(userId);
  const referrer = referrerId !== '' ? await userService.getReferrer(referrerId) : {};
  if (referrer.email === config.email.adminEmail) {
    const referrerResponse = {};
    referrerResponse.email = null;
    referrerResponse.id = null;
    referrerResponse.nickName = referrer.nickName;
    return referrerResponse;
  }
  return referrer;
};

const getIntroducer = async (userId) => {
  const parent = await findReferrerId(userId);
  if (parent) {
    const referrer = await userService.getUserById(parent);
    const fullName =
      (referrer.lastName ? `${referrer.lastName} ` : '') +
      (referrer.firstName ? `${referrer.firstName} ` : '') +
      (referrer.middleName ? referrer.middleName : '');
    const introducer = {
      id: referrer._id,
      fullName: fullName.trim(),
      nickName: referrer.nickName,
      email: referrer.email,
    };

    return introducer;
  }
  return null;
};

const getIntroducerForMeRoute = async (userId) => {
  const parent = await findReferrerId(userId);
  if (parent) {
    const referrer = await userService.getUserById(parent);
    const fullName =
      (referrer.lastName ? `${referrer.lastName} ` : '') +
      (referrer.firstName ? `${referrer.firstName} ` : '') +
      (referrer.middleName ? referrer.middleName : '');
    const introducer = {
      id: referrer._id,
      fullName: fullName.trim(),
      nickName: referrer.nickName,
      email: referrer.email,
    };
    if (introducer.email === config.email.adminEmail) {
      introducer.email = null;
      introducer.id = null;
    }

    return introducer;
  }
  return null;
};

const updateReferrer = async (userId, referrerEmail) => {
  const newreferrer = await userService.getUserByEmail(referrerEmail);

  let mlmObj = await Mlm.findOne({ user: userId });

  const newReferrerMlmObj = await Mlm.findOne({ user: newreferrer.id });

  if (!mlmObj) throw new ApiError(httpStatus.NOT_FOUND, 'User does not exists.');
  if (!newreferrer) throw new ApiError(httpStatus.NOT_FOUND, 'User with provided email does not exist.');

  if (mlmObj.parent) {
    const parent = await Mlm.findOne({ user: mlmObj.parent });
    if (parent.children.length > 0) {
      const index = parent.children.indexOf(mlmObj.user);
      parent.children.splice(index, 1);
    }
    await parent.save();
  }

  newReferrerMlmObj.children.push(mlmObj.user);
  await newReferrerMlmObj.save();

  mlmObj.parent = newreferrer;
  mlmObj = await mlmObj.save();
  return { mlmObj, message: 'Referrer updated successfully.' };
};

const updateReferrerByReferrerId = async (userId, referrerId) => {
  const newreferrer = await userService.getUserById(referrerId);
  let mlmObj = await Mlm.findOne({ user: userId });
  const newReferrerMlmObj = await Mlm.findOne({ user: newreferrer.id });

  if (!mlmObj) throw new ApiError(httpStatus.NOT_FOUND, 'User does not exists.');
  if (!newreferrer) throw new ApiError(httpStatus.NOT_FOUND, 'User with provided email does not exist.');

  if (mlmObj.parent) {
    const parent = await Mlm.findOne({ user: mlmObj.parent });
    if (parent.children.length > 0) {
      const index = parent.children.indexOf(mlmObj.user);
      parent.children.splice(index, 1);
    }
    await parent.save();
  }

  newReferrerMlmObj.children.push(mlmObj.user);
  await newReferrerMlmObj.save();

  mlmObj.parent = newreferrer;
  mlmObj = await mlmObj.save();
  return { mlmObj, message: 'Referrer updated successfully.' };
};

const testGetMlmTree = async (userId) => {
  const children = await mlmTree.getDecendants(userId, mlmConsts.DESCENDANT_VISIBILITY_LEVEL);
  const parent = await Mlm.findOne({ user: userId }, 'parent').exec();
  return { parent, children };
};

const executeUserMlmTree = async (userId, level, visibilityLevel) => {
  const userObj = await Mlm.findOne({ user: userId });
  if (!userObj.user) {
    return {};
  }
  const userInfo = await userService.getMlmUser(userObj.user);

  const user = {
    user: {
      firstName: userInfo.firstName ? userInfo.firstName : '',
      lastName: userInfo.lastName ? userInfo.lastName : '',
      middleName: userInfo.middleName ? userInfo.middleName : '',
      nickName: userInfo.nickName,
      email: userInfo.email,
      id: userInfo.id,
    },
    level,
    children: [],
  };

  if (level === visibilityLevel) {
    return user;
  }

  if (userObj.children.length > 0) {
    for (let index = 0; index < userObj.children.length; index += 1) {
      user.children.push(await executeUserMlmTree(userObj.children[index], level + 1, visibilityLevel));
    }
  }
  return user;
};

const getUserMlmTree = async (userId, role) => {
  const visibilityLevel = role === 'admin' ? mlmConsts.ADMIN_VISIBILITY_LEVEL : mlmConsts.DESCENDANT_VISIBILITY_LEVEL;
  let tree = null;
  console.log(`UserId: ${userId} \t role: ${role}`);
  tree = await executeUserMlmTree(userId, mlmConsts.ROOT_LEVEL, visibilityLevel);
  console.log(tree);
  return tree;
};

const executeMlmRequests = async () => {
  const pendingRequests = await MlmRequest.find({ status: 'pending' }).exec();

  if (!pendingRequests || pendingRequests.length <= 0) {
    return;
  }

  await pendingRequests.forEach(async (request) => {
    console.log(`Current request being executed: ${request}`);
    const newTree = await getUserMlmTree(request.user, request.role);
    const previousTree = await MlmTree.findOne({ user: request.user });

    if (previousTree) {
      await MlmTree.findOneAndDelete({ user: request.user });
    }
    await new MlmTree({
      user: request.user,
      tree: newTree,
      requestedTime: request.requestedTime,
      executionTime: new Date(),
    }).save();
    await MlmRequest.findByIdAndDelete(request.id);

    // if (newTree && previousTree) {
    //   console.log(`previousTree and newTree : ${newTree && previousTree}`);
    //   const updatedTree = await MlmTree.findOneAndUpdate(
    //     { user: request.user },
    //     { $set: { tree: newTree, requestedTime: request.requestedTime, executionTime: new Date() } },
    //     { new: true }
    //   );
    //   await MlmRequest.findByIdAndDelete(request.id);
    // } else if (newTree && !previousTree) {
    //   console.log(`!previousTree and newTree : ${newTree && !previousTree}`);
    //   await new MlmTree({
    //     user: request.user,
    //     tree: newTree,
    //     requestedTime: request.requestedTime,
    //     executionTime: new Date(),
    //   }).save();
    //   await MlmRequest.findByIdAndDelete(request.id);
    // }
  });
};

const updateMlmTree = async (userId, role) => {
  const date = new Date();
  const user = await userService.getUserById(userId);
  const mlmRequest = await new MlmRequest({ user, role, requestedTime: date });
  const result = await mlmRequest.save();
  console.log(result);
  return result;
};

const updateMlmTreeByEmail = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, `User does not exists.`);
  const result = await updateMlmTree(user.id, user.role);
  return result;
};

const getMlmTreeByUserId = async (userId, role) => {
  const treeObj = await MlmTree.findOne({ user: userId });
  const response = { treeObj: {}, message: null };

  if (!treeObj) {
    await updateMlmTree(userId, role);
    response.message = `You don't have any genereted tree. An update request created to the server. You will be able to see that within 24 hours.`;
    return response;
  }

  response.treeObj.user = treeObj.user;
  response.treeObj.message = treeObj.message;
  response.treeObj.tree = JSON.parse(treeObj.tree);
  response.treeObj.requestedTime = treeObj.requestedTime;
  response.treeObj.executionTime = treeObj.executionTime;

  response.message = `Previous tree has been returnd. You may update your tree using the update Button.`;
  return response;
};

const getMlmTree = async (userId, role, email) => {
  let treeObj = null;

  if (email && role === 'admin') {
    const user = await userService.getUserByEmail(email);
    treeObj = await getMlmTreeByUserId(user.id, user.role);
  } else treeObj = await getMlmTreeByUserId(userId, role);
  return treeObj;
};

const calculeteRewardAmount = async (dollarPrice, percentage) => {
  return (dollarPrice * percentage) / 100;
};

const rewardReferralPoint = async (purchaser, receiver, purchasedAmount, receivedPercentage, orderId, level) => {
  const receivedAmount = await calculeteRewardAmount(purchasedAmount, receivedPercentage);
  const refPoint = await refPointService.addPoint(
    purchaser,
    receiver,
    purchasedAmount,
    receivedPercentage,
    receivedAmount,
    orderId,
    level
  );
  if (refPoint) return true;
  return false;
};

const executeReferralPoint = async (userId, orderId, packagePrice, level) => {
  const purchaser = userId;
  let currentUserId = userId;
  const precentages = [5, 3, 2, 1, 1];

  for (let currentLevel = level; currentLevel < mlmConsts.REFERRAL_POINT_EXECUTION_ENDING_LEVEL; currentLevel += 1) {
    const currentUser = await Mlm.findOne({ user: currentUserId });
    const currentUsersParent = currentUser.parent;
    const currentPersentage = precentages[currentLevel];

    if (!currentUsersParent) break;
    const isRewarded = await rewardReferralPoint(
      purchaser,
      currentUsersParent,
      packagePrice,
      currentPersentage,
      orderId,
      currentLevel + 1
    );

    if (!isRewarded) {
      currentLevel -= 1;
    } else {
      currentUserId = currentUsersParent;
    }
  }

  return true;
};

const handleReferralPoint = async (userId, orderId, packagePrice) => {
  if (!userId || !packagePrice) throw new ApiError(httpStatus.BAD_REQUEST, 'Must provide userId and package price.');
  if (packagePrice < 0.0) throw new ApiError(httpStatus.BAD_REQUEST, 'packagePrice must be greater than 0');
  console.log('camt to handleReferralPoint');
  const done = executeReferralPoint(userId, orderId, packagePrice, mlmConsts.REFERRAL_POINT_EXECUTION_STARTING_LEVEL);

  if (done) return { status: true, message: 'All eligible users have been rewarded.' };
  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not reward referral point');
};

module.exports = {
  addById,
  addByEmail,
  getMlmTree,
  getReferrer,
  findByUserId,
  deleteMlmObj,
  getIntroducer,
  updateMlmTree,
  getUserMlmTree,
  findReferrerId,
  updateReferrer,
  hasAlreadyJoined,
  executeMlmRequests,
  getMlmTreeByUserId,
  handleReferralPoint,
  updateMlmTreeByEmail,
  getIntroducerForMeRoute,
  updateReferrerByReferrerId,
};

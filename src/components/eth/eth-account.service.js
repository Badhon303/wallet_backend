const axios = require('axios').default;
// const Web3 = require('web3-eth-accounts');
const httpStatus = require('http-status');

const { userService } = require('../../services');

const EthAccount = require('./eth-account.model');
const ApiError = require('../../utils/ApiError');
const config = require('../../config/config');
const { encryptIpAddress, encryptEmailAddress } = require('../../utils/crypto');

// const web3 = new Web3(config.web3.url);

// const create = async (userId) => {
//   const newAccount = web3.create();
//   const user = await userService.getUserById(userId);
//   const createdAddress = await EthAccount.create({ address: newAccount.address, user });

//   if (!createdAddress) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create blockchain account');
//   }
//   const ethAccount = {};
//   ethAccount.address = createdAddress.address;
//   ethAccount.privateKey = newAccount.privateKey;
//   return ethAccount;
// };

/**
 * Create an address in blockchain network
 * @returns {Promise-addressDetails}
 */
// const createBlockchainAccount = async () => {
//   const newAccount = web3.create();

//   const createdAddress = await EthAccount.create({
//     address: newAccount.address,
//     // privateKey: newAccount.privateKey,
//   });

//   if (!createdAddress) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Failed to create blockchain account');
//   }
//   createdAddress._doc.privateKey = newAccount.privateKey;
//   return createdAddress;
// };

/**
 * Fetch the balance for a particular token
 * @param {address} ethereum_public_address
 * @param {currency} currency_type
 * @param {type} token_type
 * @returns {Promise-addressDetails}
 */
const getBalance = async (address, currency, type) => {
  try {
    const encryptedIp = encryptIpAddress(config.crypto.currentIP);
    const response = await axios.get(
      `${config.blockchainApi.url}/api/get-balance?address=${address}&currency=${currency}&type=${type}`,
      { headers: { Authorization: encryptedIp } }
    );

    if (!response) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Failed to get balance');
    }
    return response.data;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const getTokenBalanceByUserId = async (userId, currency, type) => {
  const account = await EthAccount.findOne({ user: userId });

  if (!account) {
    return 0;
  }
  const balance = await getBalance(account.address, currency, type);
  return balance;
};

const getById = async (accountId) => {
  const result = await EthAccount.findById(accountId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, `No blockchain account exists with provided id`);
  }
  return result;
};

const getByUserId = async (userId, responseNeeded = 0) => {
  const ethAccount = await EthAccount.findOne({ user: userId }, 'address').exec();
  if (!ethAccount) {
    if (responseNeeded) return null;
    throw new ApiError(httpStatus.NOT_FOUND, 'User has no registered eth account yet');
  }
  return ethAccount;
};

const getAllAccount = async () => {
  let result = await EthAccount.find();
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, `No blockchain account exists with provided id`);
  }
  result = await userService.eliminateAdminAccount(result);
  return result;
};

const sendToken = async (role, args) => {
  // Hot Wallet Code started

  // const transferObj = {};

  // if (from_type === 'admin') {
  //   transferObj.type = type;
  //   transferObj.pkey = encryptPrivateKey(decryptPrivateKey(pkey));
  //   transferObj.amount = amount;
  //   transferObj.currency = currency;
  //   transferObj.from_type = from_type;
  //   transferObj.toAddress = toAddress;
  //   transferObj.transactionFee = transactionFee;
  // } else {
  //   transferObj.type = type;
  //   transferObj.pkey = encryptPrivateKey(decryptPrivateKey(pkey));
  //   transferObj.amount = amount;
  //   transferObj.currency = currency;
  //   transferObj.from_type = from_type;
  //   transferObj.toAddress = toAddress;
  //   transferObj.fromAddress = fromAddress;
  //   transferObj.transactionFee = transactionFee;
  // }

  // Hot Wallet Code Ended

  const transferObj = { ...args };
  transferObj.amount = Number(transferObj.amount);

  if (role === 'admin') {
    transferObj.from_address = transferObj.currency === 'BTC' ? config.admin.btcAddress : config.admin.ethAddress;
  }
  transferObj.user = encryptEmailAddress(transferObj.user);

  try {
    const res = await axios.post(`${config.blockchainApi.url}/api/transfer`, transferObj, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });

    if (!res) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to transfer token to the recipient address`);
    }
    return res.data;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const deleteEthAcc = async (userId) => {
  const response = await EthAccount.deleteOne({ user: userId });
  return response;
};

const checkUserExist = async (userId) => {
  const response = await EthAccount.findOne({ user: userId });
  if (response) return true;
};

const calculateTxFee = async (requestBodyData) => {
  requestBodyData.amount = Number(requestBodyData.amount);
  requestBodyData.user = encryptEmailAddress(requestBodyData.user);
  // console.log(requestBodyData);
  try {
    const res = await axios.post(`${config.blockchainApi.url}/api/calculate-tx-fee`, requestBodyData, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });
    if (!res) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to transfer token to the recipient address`);
    }
    return res.data;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const storeAddress = async (userId, address) => {
  const existingUser = await EthAccount.findOne({ user: userId, address });
  if (existingUser) throw new ApiError(httpStatus.BAD_REQUEST, 'User already have an account');

  const storeStatus = await EthAccount.create({ address, user: userId });

  if (!storeStatus) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create blockchain account');
  }

  return storeStatus;
};

const checkIfUserHasTokenBeforeDelete = async (userId) => {
  let wolf = await getTokenBalanceByUserId(userId, 'WOLF', 'erc20');
  let eagle = await getTokenBalanceByUserId(userId, 'EAGLE', 'erc20');
  let snow = await getTokenBalanceByUserId(userId, 'SNOW', 'erc20');

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

module.exports = {
  // create,
  getBalance,
  getById,
  getByUserId,
  sendToken,
  getAllAccount,
  deleteEthAcc,
  checkUserExist,
  calculateTxFee,
  storeAddress,
  getTokenBalanceByUserId,
  checkIfUserHasTokenBeforeDelete,
};

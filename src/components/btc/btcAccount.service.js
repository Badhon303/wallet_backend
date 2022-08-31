// const bitcore = require('bitcore-lib');
const httpStatus = require('http-status');

const BtcAccount = require('./btcAccount.model');
// const { User } = require('../../models/index');
const ApiError = require('../../utils/ApiError');

// const createKeyPair = async () => {
//   const privateKey = new bitcore.PrivateKey();
//   const address = privateKey.toAddress();
//   return { address, key: privateKey };
// };

// const create = async (userId) => {
//   const existingAcc = await BtcAccount.find({ user: userId });
//   if (existingAcc.length > 0) {
//     throw new ApiError(httpStatus.CONFLICT, 'There exists one registered BTC account.');
//   }

//   const keyPair = await createKeyPair();
//   const user = await User.findById(userId);
//   const btcAcc = new BtcAccount({ address: keyPair.address, user });
//   const createdAccount = await btcAcc.save();

//   const response = {
//     id: createdAccount.id,
//     address: createdAccount.address,
//     privateKey: keyPair.key,
//   };
//   return response;
// };

// const getKeyPair = async (btcAddress) => {
//   const { address, key } = await BtcAccount.findOne({ address: btcAddress });
//   if (!address || !key) {
//     throw new ApiError('BTC account is not connected.');
//   }
//   return { address, key };
// };

const transfer = async (id, sendersAddress, recipientsAddress, amount) => {
  const btcAccount = await BtcAccount.findById(id);
  if (btcAccount.balance < amount) {
    throw new ApiError('Insufficient Balance');
  }

  // const sender = await getKeyPair(sendersAddress);
  // let transaction = new bitcore.Transaction();
  // transaction.from(sender.address);
  // transaction.to(recipientsAddress, amount);
};

const getBtcAccountsByUserId = async (userId, responseNeeded = 0) => {
  const btcAccount = await BtcAccount.findOne({ user: userId }, 'address').exec();

  if (!btcAccount) {
    if (responseNeeded) return null;
    throw new ApiError(httpStatus.NOT_FOUND, 'No BTC account registered.');
  }

  return btcAccount;
};

const deleteBtcAcc = async (userId) => {
  const response = await BtcAccount.deleteOne({ user: userId });
  return response;
};

const storeAddress = async (userId, address) => {
  const existingUser = await BtcAccount.findOne({ user: userId, address });

  if (existingUser) throw new ApiError(httpStatus.BAD_REQUEST, 'User already have an account');

  const storedBtcAddress = await BtcAccount.create({ address, user: userId });

  if (!storedBtcAddress) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create blockchain accounts');
  }

  return storedBtcAddress;
};

module.exports = {
  // create,
  // getKeyPair,
  getBtcAccountsByUserId,
  transfer,
  deleteBtcAcc,
  storeAddress,
};

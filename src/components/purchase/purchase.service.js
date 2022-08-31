const axios = require('axios').default;

const { userService } = require('../../services');

const Purchase = require('./purchase.model');
const ApiError = require('../../utils/ApiError');
const config = require('../../config/config');
const { encryptIpAddress, encryptEmailAddress } = require('../../utils/crypto');

const getPackageList = async () => {
  const apiEndpoint = '/api/get-items';

  const url = config.blockchainApi.url + apiEndpoint;
  try {
    const packages = await axios.get(url, { headers: { Authorization: encryptIpAddress(config.crypto.currentIP) } });
    return packages.data.result;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const getCalculationResult = async (bodyData) => {
  const apiEndpoint = `/api/cart-calculate`;
  const url = config.blockchainApi.url + apiEndpoint;
  bodyData.payment_from_user = encryptEmailAddress(bodyData.payment_from_user);

  try {
    if (typeof bodyData.items !== 'string') {
      bodyData.items = JSON.stringify(bodyData.items);
    }
    const response = await axios.post(url, bodyData, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });
    return response.data;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const submitCart = async (userId, bodyData) => {
  const apiEndpoint = `/api/cart-submit`;
  const url = config.blockchainApi.url + apiEndpoint;

  try {
    if (typeof bodyData.items !== 'string') {
      bodyData.items = JSON.stringify(bodyData.items);
    }
    // bodyData.payment_from_pkey = encryptPrivateKey(decryptPrivateKey(bodyData.payment_from_pkey));
    const user = await userService.getUserById(userId);

    bodyData.payment_from_user = encryptEmailAddress(bodyData.payment_from_user);

    const response = await axios.post(url, bodyData, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });
    const orderId = response.data.result.order_id;
    const newPurchase = new Purchase({ user, orderId });

    await newPurchase.save();
    return response.data;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const getOrdersByUserId = async (userId, options) => {
  const apiEndpoint = '/api/get-order?id=';
  const url = config.blockchainApi.url + apiEndpoint;
  // const purchaseList = await Purchase.find({ user: userId }, 'orderId').exec();

  const purchaseList = await Purchase.paginate({ user: userId }, options);
  try {
    const orders = await purchaseList.results.map(async (purchase) => {
      const urlWithId = url + purchase.orderId;
      const order = await axios.get(urlWithId, {
        headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
      });
      return order.data.result;
    });
    return Promise.all(orders);
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const constructResponseWithPagination = async (orders, userId, options) => {
  const purchaseList = await Purchase.paginate({ user: userId }, options);
  const paginationObj = {
    page: purchaseList.page,
    limit: purchaseList.limit,
    totalPages: purchaseList.totalPages,
    totalResults: purchaseList.totalResults,
  };
  return { orders, ...paginationObj };
};

const getOrderDetailsById = async (orderId) => {
  const apiEndpoint = '/api/get-order?id=';
  const url = config.blockchainApi.url + apiEndpoint + orderId;
  try {
    const details = await axios.get(url, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });
    return details.data.result;
  } catch (error) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
};

const getPurchaseHistory = async (filter, options) => {
  const allOrders = await Purchase.paginate(filter, options);
  return allOrders;
};

const mergeUserObject = async (allOrders) => {
  const allUsers = [];
  for (let i = 0; i < allOrders.results.length; i += 1) {
    const user = await userService.getUserById(allOrders.results[i].user);
    const result = {
      fullName:
        (user.lastName ? `${user.lastName} ` : '') +
        (user.firstName ? `${user.firstName} ` : '') +
        (user.middleName ? user.middleName : ''),
      email: user.email,
      orderId: allOrders.results[i].orderId,
    };
    allUsers.push(result);
  }
  return allUsers;
};

const mergeStatusAndTime = async (users) => {
  const response = [];
  const apiEndpoint = '/api/get-order?id=';
  const url = config.blockchainApi.url + apiEndpoint;
  for (let i = 0; i < users.length; i += 1) {
    const order = await axios.get(url + users[i].orderId, {
      headers: { Authorization: encryptIpAddress(config.crypto.currentIP) },
    });

    if (!order.data.result[0]) {
      i += 1;
    } else {
      const obj = {
        ordered_at: order.data.result[0].ordered_at,
        status: order.data.result[0].status,
        fullName: users[i].fullName,
        email: users[i].email,
        orderId: users[i].orderId,
      };
      response.push(obj);
    }
  }

  response.sort((x, y) => {
    return new Date(y.ordered_at) - new Date(x.ordered_at);
  });
  return response;
};

const hasPurchased = async (userId) => {
  const orders = await Purchase.find({ user: userId });
  if (orders.length >= 1) return true;
  return false;
};

module.exports = {
  getPackageList,
  getCalculationResult,
  submitCart,
  getOrdersByUserId,
  getOrderDetailsById,
  getPurchaseHistory,
  mergeUserObject,
  mergeStatusAndTime,
  constructResponseWithPagination,
  hasPurchased,
};

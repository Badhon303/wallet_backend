const { helpers } = require('faker');
const cryptaddress = require('cryptaddress-validator');

// Validates if the request contains valid MongoDB Id
const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

// Validates password must be at least 4 characters and contain 1 letter and number
const password = (value, helpers) => {
  if (value.length < 4) {
    return helpers.message('password must be at least 4 characters');
  }
  if (value.length > 8) {
    return helpers.message('password can not be greater than 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }
  return value;
};

const dateOfBirth = (date) => {
  const selectedDate = new Date(date);
  const todaysdate = new Date();
  todaysdate.setHours(0, 0, 0, 0);
  if (!(selectedDate.getTime() < todaysdate.getTime())) {
    return helpers.message('Date of birth must not be toady and forward');
  }
  return date;
};

const btcAddress = (value) => {
  if (!value.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
    return helpers.message('Must be a valid Bitcoin account address.');
  }
  return value;
};

const cryptoAddressValidate = (address, type, currency) => {
  let result = false;
  if (type === 'erc20') {
    result = cryptaddress('eth').test(address);
  } else if (type === 'coin' && currency === 'ETH') {
    result = cryptaddress('eth').test(address);
  } else if (type === 'coin' && currency === 'BTC') {
    result = cryptaddress('btc').test(address);
  }

  if (!result) {
    return helpers.message('Must enter a valid public address');
  }
};

module.exports = {
  objectId,
  password,
  dateOfBirth,
  btcAddress,
  cryptoAddressValidate,
};

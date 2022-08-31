/* eslint-disable security/detect-non-literal-regexp */
const CryptoJS = require('crypto-js');
const config = require('../config/config');

const encryptIpAddress = (ipAddress) => {
  const ciphertext = CryptoJS.AES.encrypt(ipAddress, config.crypto.authSecret).toString();
  return ciphertext;
};

const encryptEmailAddress = (email) => {
  const ciphertext = CryptoJS.AES.encrypt(email, config.crypto.emailKeySecret).toString();
  return ciphertext;
};

// const decryptPrivateKey = (pk) => {
//   const bytes = CryptoJS.AES.decrypt(pk, config.crypto.clientPrivateKeySecret);
//   const originalText = bytes.toString(CryptoJS.enc.Utf8);
//   return originalText;
// };

// const encrypt = (message) => {
//   // const tmp = message[0];
//   // message = message.replace(new RegExp(`^${message[0]}`), message[message.length - 1]);
//   // message = message.replace(new RegExp(`${message[message.length - 1]}$`), tmp);

//   // message = message.split('');

//   // for (let i = 0; i < message.length; i += 1) {
//   //   message[i] = String.fromCharCode(message[i].charCodeAt(0) + 3);
//   // }

//   // message = message.join('');

//   const ciphertext = CryptoJS.AES.encrypt(message, config.pkSecret.secret).toString();

//   return ciphertext;
// };

// const decrypt = (message) => {
//   const bytes = CryptoJS.AES.decrypt(message, config.pkSecret.secret);
//   message = bytes.toString(CryptoJS.enc.Utf8);

//   // message = message.split('');

//   // for (let i = 0; i < message.length; i += 1) {
//   //   message[i] = String.fromCharCode(message[i].charCodeAt(0) - 3);
//   // }
//   // message = message.join('');

//   // const tmp = message[0];
//   // message = message.replace(new RegExp(`^${message[0]}`), message[message.length - 1]);
//   // message = message.replace(new RegExp(`${message[message.length - 1]}$`), tmp);

//   return message;
// };

module.exports = {
  encryptIpAddress,
  encryptEmailAddress,
  // decryptPrivateKey,
  // encrypt,
  // decrypt,
};

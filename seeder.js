/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const config = require('./src/config/config');

// Load model files
const User = require('./src/models/user.model');
const Token = require('./src/models/token.model');
const EthAccount = require('./src/components/eth/eth-account.model');
const Mlm = require('./src/components/mlm/mlm.model');
const Privilege = require('./src/components/privileges/privileges.model');
const Role = require('./src/components/roles/roles.model');

// Connect to Development DB
mongoose.connect(
  'mongodb+srv://admin:leads@123@wes-wallet.vfrzo.mongodb.net/wesWallet?retryWrites=true&w=majority',
  config.mongoose.options
);

// Connect to Production DB
// mongoose.connect(
//   'mongodb+srv://a5YSdSKUouj8ahkJ:a5YSdSKUouj8ahkJ@wes-wallet.1ttit.mongodb.net/wesWallet?retryWrites=true&w=majority',
//   config.mongoose.options
// );

// Load JSON file for bootcamp model
const users = JSON.parse(fs.readFileSync(`${__dirname}/src/_data_/users.json`, 'utf-8'));
const tokens = JSON.parse(fs.readFileSync(`${__dirname}/src/_data_/tokens.json`, 'utf-8'));
const ethAccount = JSON.parse(fs.readFileSync(`${__dirname}/src/_data_/ethaccounts.json`, 'utf-8'));
const mlm = JSON.parse(fs.readFileSync(`${__dirname}/src/_data_/mlms.json`, 'utf-8'));
const privilege = JSON.parse(fs.readFileSync(`${__dirname}/src/_data_/privileges.json`, 'utf-8'));
const role = JSON.parse(fs.readFileSync(`${__dirname}/src/_data_/roles.json`, 'utf-8'));

// Import data from bootcamp.json file to the bootcamp collection
const importData = async (docName) => {
  switch (docName) {
    case 'users': {
      const userData = await User.create(users);
      if (userData) {
        console.log('Successfully Imported Users Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed to Import Users Data');
      }
      break;
    }
    case 'tokens': {
      const tokenData = await Token.create(tokens);
      if (tokenData) {
        console.log('Successfully Imported Token Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed to Import Tokens Data');
      }
      break;
    }
    case 'ethAccounts': {
      const ethAccData = await EthAccount.create(ethAccount);
      if (ethAccData) {
        console.log('Successfully Imported Ethereum Blockchain Account Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed To Import Ethereum Blockchain Account Data');
      }
      break;
    }
    case 'mlms': {
      const mlmData = await Mlm.create(mlm);
      if (mlmData) {
        console.log('Successfully Imported MLM Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed To Import MLM Data');
      }
      break;
    }
    case 'privileges': {
      const privilegeData = await Privilege.create(privilege);
      if (privilegeData) {
        console.log('Successfully Imported Privilege Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed To Import Privilege Data');
      }
      break;
    }
    case 'roles': {
      const roleData = await Role.create(role);
      if (roleData) {
        console.log('Successfully Imported Role Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed To Import Role Data');
      }
      break;
    }
    default:
      console.log('Document name value mmust be within users, tokens, ethAccounts, mlms, privileges, roles');
  }
};

// Delete all data from bootcamp collection on db
const deleteData = async (docName) => {
  switch (docName) {
    case 'users': {
      const userData = await User.deleteMany();
      if (userData) {
        console.log('Successfully Deleted User Document Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed to Delete Users Data');
      }
      break;
    }
    case 'tokens': {
      const tokenData = await Token.deleteMany();
      if (tokenData) {
        console.log('Successfully Deleted Token Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed to Delete Tokens Data');
      }
      break;
    }
    case 'ethaccounts': {
      const ethAccData = await EthAccount.deleteMany();
      if (ethAccData) {
        console.log('Successfully Deleted Ethereum Blockchain Account Informations'.green.inverse);
        process.exit();
      } else {
        console.log('Failed To Delete Ethereum Blockchain Account Informations');
      }
      break;
    }
    case 'mlms': {
      const mlmData = await Mlm.deleteMany();
      if (mlmData) {
        console.log('Successfully Deleted MLM Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed To Delete MLM Data');
      }
      break;
    }
    case 'privileges': {
      const privilegeData = await Privilege.deleteMany();
      if (privilegeData) {
        console.log('Successfully Deleted Privilege Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed To Delete Privilege Data');
      }
      break;
    }
    case 'roles': {
      const roleData = await Role.deleteMany();
      if (roleData) {
        console.log('Successfully Deleted Role Data'.green.inverse);
        process.exit();
      } else {
        console.log('Failed To Delete Role Data');
      }
      break;
    }
    default:
      console.log('Document name value mmust be within users, tokens, ethAccounts, mlms, privileges, roles');
  }
};

// Fetch Data from database and store in files
const storeDbToFile = async (docName) => {
  switch (docName) {
    case 'users': {
      const userData = await User.find();
      fs.writeFileSync('./src/_data_/users.json', JSON.stringify(userData, null, 2));
      console.log('Successfully fetched data from User Doc and stored in users.json file'.green.inverse);
      process.exit();
      break;
    }
    case 'tokens': {
      const tokenData = await Token.find();
      fs.writeFileSync('./src/_data_/tokens.json', JSON.stringify(tokenData, null, 2));
      console.log('Successfully fetched data from Token Doc and stored in tokens.json file'.green.inverse);
      process.exit();
      break;
    }
    case 'ethAccounts': {
      const ethAccData = await EthAccount.find();
      fs.writeFileSync('./src/_data_/ethAccounts.json', JSON.stringify(ethAccData, null, 2));
      console.log('Successfully fetched data from ethAccount Doc and stored in ethAccounts.json file'.green.inverse);
      process.exit();
      break;
    }
    case 'mlms': {
      const mlmData = await Mlm.find();
      fs.writeFileSync('./src/_data_/mlms.json', JSON.stringify(mlmData, null, 2));
      console.log('Successfully fetched data from Mlms Doc and stored in mlms.json file'.green.inverse);
      process.exit();
      break;
    }
    case 'privileges': {
      const privilegeData = await Privilege.find();
      fs.writeFileSync('./src/_data_/privileges.json', JSON.stringify(privilegeData, null, 2));
      console.log('Successfully fetched data from Privilege Doc and stored in privileges.json file'.green.inverse);
      process.exit();
      break;
    }
    case 'roles': {
      const roleData = await Role.find();
      fs.writeFileSync('./src/_data_/roles.json', JSON.stringify(roleData, null, 2));
      console.log('Successfully fetched data from User Doc and stored in users.json file'.green.inverse);
      process.exit();
      break;
    }
    default: {
      console.log('import value within users, tokens, ethAccounts, mlms, privileges, roles'.red.inverse);
      process.exit(1);
    }
  }
};

// Import all the data from local storage to the database
const importAll = async () => {
  try {
    const userData = await User.create(users);
    const tokenData = await Token.create(tokens);
    const ethAccountData = await EthAccount.create(ethAccount);
    const mlmData = await Mlm.create(mlm);
    const privilegeData = await Privilege.create(privilege);
    const roleData = await Role.create(role);

    if (userData && tokenData && ethAccountData && mlmData && privilegeData && roleData) {
      console.log('Successfully Data Imported'.green.inverse);
      process.exit();
    }
  } catch (err) {
    console.error(err);
  }
};

// Delete data from all the documents inside the database
const deleteAll = async () => {
  try {
    const userData = await User.deleteMany();
    const tokenData = await Token.deleteMany();
    const ethAccountData = await EthAccount.deleteMany();
    const mlmData = await Mlm.deleteMany();
    const privilegeData = await Privilege.deleteMany();
    const roleData = await Role.deleteMany();

    if (userData && tokenData && ethAccountData && mlmData && privilegeData && roleData) {
      console.log('Successfully Deleted Data'.green.bgRed);
      process.exit();
    }
  } catch (err) {
    console.error(err);
  }
};

// Backup all data from database to local file storage
const backupAllDocs = async () => {
  const userData = await User.find();
  const tokenData = await Token.find();
  const ethAccData = await EthAccount.find();
  const mlmData = await Mlm.find();
  const privilegeData = await Privilege.find();
  const roleData = await Role.find();

  fs.writeFileSync('./src/_data_/users.json', JSON.stringify(userData, null, 2));
  fs.writeFileSync('./src/_data_/tokens.json', JSON.stringify(tokenData, null, 2));
  fs.writeFileSync('./src/_data_/ethAccounts.json', JSON.stringify(ethAccData, null, 2));
  fs.writeFileSync('./src/_data_/mlms.json', JSON.stringify(mlmData, null, 2));
  fs.writeFileSync('./src/_data_/privileges.json', JSON.stringify(privilegeData, null, 2));
  fs.writeFileSync('./src/_data_/roles.json', JSON.stringify(roleData, null, 2));

  console.log('Successfully fetched data from All Documents and stored in local file storage'.green.inverse);
  process.exit();
};

if (process.argv[2] === '-import' && process.argv[3]) {
  importData(process.argv[3]);
} else if (process.argv[2] === '-delete' && process.argv[3]) {
  deleteData(process.argv[3]);
} else if (process.argv[2] === '-backup' && process.argv[3]) {
  storeDbToFile(process.argv[3]);
} else if (process.argv[2] === '-importall') {
  importAll();
} else if (process.argv[2] === '-deleteall') {
  deleteAll();
} else if (process.argv[2] === '-backupall') {
  backupAllDocs();
}

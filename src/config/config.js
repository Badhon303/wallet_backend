const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    // NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    MONGODB_URL_DEV: Joi.string().description('Database URL for DEV server'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    FROM_NAME: Joi.string().description(`Sender's name`),
    FILE_UPLOAD_PATH: Joi.string().required().description('The path where photos are stored'),
    MAX_FILE_UPLOAD: Joi.number().required().description('The maximum file size that is allowed to upload'),
    ADMIN_EMAIL: Joi.string().email().required(),
    ADMIN_NAME: Joi.string().required(),
    BASE_SHAREABLE_URL: Joi.string().uri().pattern(
      // eslint-disable-next-line security/detect-unsafe-regex
      new RegExp(
        '^(http://www.|https://www.|http://|https://)?[a-z0-9]+(:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9][0-9]|6[0-4][0-9][0-9][0-9]|d{2,4}|[1-9]))?'
      )
    ),
    SHARE_VIA_QR: Joi.string().valid('QR'),
    SHARE_VIA_MAIL: Joi.string().valid('EMAIL'),
    SHARE_VIA_LINK: Joi.string().valid('LINK'),

    // dev envs
    BASE_SHAREABLE_URL_DEV: Joi.string().uri().pattern(
      // eslint-disable-next-line security/detect-unsafe-regex
      new RegExp(
        '^(http://www.|https://www.|http://|https://)?[a-z0-9]+(:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9][0-9]|6[0-4][0-9][0-9][0-9]|d{2,4}|[1-9]))?'
      )
    ),
    BASE_URL: Joi.string().uri().required(),
    BASE_URL_DEV: Joi.string().uri(),
    WEB3_DEV: Joi.string(),
    WEB3_PROD: Joi.string(),
    BLOCKCHAIN_API_URL: Joi.string().uri(),
    BLOCKCHAIN_API_URL_DEV: Joi.string().uri(),
    DOMAIN_NAME_DEV: Joi.string().description('Domain name'),
    SMTP_HOST_DEV: Joi.string().description('server that will send the emails'),
    SMTP_PORT_DEV: Joi.number().description('port to connect to the email server'),
    SECURE: Joi.boolean().description('Is secure'),
    SMTP_USERNAME_DEV: Joi.string().description('username for email server'),
    SMTP_PASSWORD_DEV: Joi.string().description('password for email server'),
    EMAIL_FROM_DEV: Joi.string().description('the from field in the emails sent by the app'),
    FROM_NAME_DEV: Joi.string().description(`Sender's name`),
    ADMIN_NAME_DEV: Joi.string().description('Name of admin'),
    ADMIN_EMAIL_DEV: Joi.string().email().description(`Admin's email address`),
    ADMIN_EMAIL_PROD: Joi.string().email().description(`Admin's email address`),

    // BTC ACC ENVS
    BTC_ACC_BALANCE_DEV: Joi.string().uri(),
    ADMIN_REQUEST_KEY: Joi.string().required(),
    PRIVATE_KEY_SECRET: Joi.string().required(),
    AUTH_SECRET: Joi.string().required(),
    EMAIL_KEY_SECRET: Joi.string().required(),
    CURRENT_IP_PROD: Joi.string().required(),
    CURRENT_IP_DEV: Joi.string().required(),
    DEFAULT_REFERRER_DEV: Joi.string().required(),
    DEFAULT_REFERRER_PROD: Joi.string().required(),

    // GOLD PRICE API
    GOLD_PRICE_API_URL_PROD: Joi.string().uri().required(),
    GOLD_PRICE_API_KEY_PROD: Joi.string().required(),
    GOLD_PRICE_API_URL_DEV: Joi.string().uri().required(),
    GOLD_PRICE_API_KEY_DEV: Joi.string().required(),

    // ADMIN address
    ADMIN_ETH_ADDRESS: Joi.string().required(),
    ADMIN_BTC_ADDRESS: Joi.string().required(),
    ADMIN_ETH_ADDRESS_DEV: Joi.string(),
    ADMIN_BTC_ADDRESS_DEV: Joi.string(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.NODE_ENV === 'production' ? envVars.MONGODB_URL : envVars.MONGODB_URL_DEV,
    options: {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 10,
  },
  email: {
    smtp: {
      name: envVars.NODE_ENV === 'production' ? envVars.DOMAIN_NAME : envVars.DOMAIN_NAME_DEV,
      host: envVars.NODE_ENV === 'production' ? envVars.SMTP_HOST : envVars.SMTP_HOST_DEV,
      port: envVars.NODE_ENV === 'production' ? envVars.SMTP_PORT : envVars.SMTP_PORT_DEV,
      secure: envVars.SECURE,
      auth: {
        user: envVars.NODE_ENV === 'production' ? envVars.SMTP_USERNAME : envVars.SMTP_USERNAME_DEV,
        pass: envVars.NODE_ENV === 'production' ? envVars.SMTP_PASSWORD : envVars.SMTP_PASSWORD_DEV,
      },
    },
    from: envVars.NODE_ENV === 'production' ? envVars.EMAIL_FROM : envVars.EMAIL_FROM_DEV,
    fromName: envVars.NODE_ENV === 'production' ? envVars.FROM_NAME : envVars.FROM_NAME_DEV,
    adminName: envVars.NODE_ENV === 'production' ? envVars.ADMIN_NAME : envVars.ADMIN_NAME_DEV,
    adminEmail: envVars.NODE_ENV === 'production' ? envVars.ADMIN_EMAIL_PROD : envVars.ADMIN_EMAIL_DEV,
  },
  fileUpload: {
    fileUploadPath: envVars.FILE_UPLOAD_PATH,
    maxFileSize: envVars.MAX_FILE_UPLOAD,
  },
  shareable: {
    baseUrl: envVars.NODE_ENV === 'production' ? envVars.BASE_SHAREABLE_URL : envVars.BASE_SHAREABLE_URL_DEV,
    referrerId: envVars.NODE_ENV === 'production' ? envVars.DEFAULT_REFERRER_PROD : envVars.DEFAULT_REFERRER_DEV,
    QR: envVars.SHARE_VIA_QR,
    EMAIL: envVars.SHARE_VIA_MAIL,
    LINK: envVars.SHARE_VIA_LINK,
  },
  web3: {
    url: envVars.NODE_ENV === 'production' ? envVars.WEB3_PROD : envVars.WEB3_DEV,
  },
  blockchainApi: {
    url: envVars.NODE_ENV === 'production' ? envVars.BLOCKCHAIN_API_URL : envVars.BLOCKCHAIN_API_URL_DEV,
  },
  btc: {
    getBalanceUrl: envVars.BTC_ACC_BALANCE_DEV,
  },
  adminProps: {
    reqKey: envVars.ADMIN_REQUEST_KEY,
  },
  crypto: {
    privateKeySecret: envVars.PRIVATE_KEY_SECRET,
    authSecret: envVars.AUTH_SECRET,
    currentIP: envVars.NODE_ENV === 'production' ? envVars.CURRENT_IP_PROD : envVars.CURRENT_IP_DEV,
    emailKeySecret: envVars.EMAIL_KEY_SECRET,
  },
  goldPriceApi: {
    url: envVars.NODE_ENV === 'production' ? envVars.GOLD_PRICE_API_URL_PROD : envVars.GOLD_PRICE_API_URL_DEV,
    key: envVars.NODE_ENV === 'production' ? envVars.GOLD_PRICE_API_KEY_PROD : envVars.GOLD_PRICE_API_KEY_DEV,
  },
  server: {
    url: envVars.NODE_ENV === 'production' ? envVars.BASE_URL : envVars.BASE_URL_DEV,
  },
  admin: {
    ethAddress: envVars.NODE_ENV === 'production' ? envVars.ADMIN_ETH_ADDRESS : envVars.ADMIN_ETH_ADDRESS_DEV,
    btcAddress: envVars.NODE_ENV === 'production' ? envVars.ADMIN_BTC_ADDRESS : envVars.ADMIN_BTC_ADDRESS_DEV,
  },
};

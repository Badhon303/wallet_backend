const Joi = require('joi');
const { password, objectId, dateOfBirth } = require('./custom.validation');

// Validations before creating a new user
const createUser = {
  body: Joi.object().keys({
    nickName: Joi.string()
      .regex(/^[a-zA-Z, ]*$/, 'Can be only characters')
      .min(2)
      .max(10)
      .required()
      .error(new Error('No nickName found')),
    email: Joi.string().email().required(),
    // password: Joi.string().custom(password),
    password: Joi.string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{4,8}$/)
      .min(4)
      .max(8)
      .required()
      .error(new Error('Password must be 4 to 8 characters long and must contain a character and a number')),
    termsOfUse: Joi.boolean()
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error('TermsOfUse is required.');
            default:
              return new Error('TermsOfUse must be a boolean value');
          }
        }
      }),
  }),
};

// Validations before the getting the list of all users
const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    approvalStatus: Joi.string().valid('approved', 'pending', 'rejected', 'unapplied'),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

// Validations before the getting the list of all users
const getPendingUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    approvalStatus: Joi.string().valid('approved', 'pending', 'rejected'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

// Valitation before getting a single user by Id
const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};
// Validations before updating a user information
const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId).error(new Error('Invalid User Id')),
  }),
  body: Joi.object()
    .keys({
      password: Joi.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{4,8}$/)
        .min(4)
        .max(8)
        .error(new Error('Password must be 4 to 8 characters long and must contain a character and a number')),
      firstName: Joi.string()
        .regex(/^[a-zA-Z]+[.]*$/)
        .min(2)
        .max(15)
        .error(new Error('Firstname can contain only characters and .')),
      middleName: Joi.string()
        .pattern(new RegExp(/^$|^[a-zA-Z]+$/))
        .min(2)
        .max(15)
        .allow(null)
        .allow('')
        .optional()
        .error(new Error('Middlename contains only characters')),
      lastName: Joi.string()
        .regex(/^[A-Za-z]+$/)
        .min(2)
        .max(15)
        .error(new Error('Lastname contains only characters')),
      nickName: Joi.string()
        .regex(/^[a-zA-Z]+$/)
        .min(2)
        .max(20)
        .error(new Error('Nickname contains only characters')),
      spouseName: Joi.string()
        .pattern(new RegExp(/^$|^[A-Za-z]+$/))
        .min(2)
        .max(50)
        .allow(null)
        .allow('')
        .optional()
        .error(new Error('Spouse Name can either be empty or contains only characters')),
      gender: Joi.string()
        .valid('male', 'female', 'other')
        .error(new Error('Gender must be one of these - Male, Female and Other')),
      dob: Joi.date().raw().custom(dateOfBirth).error(new Error('Date of birth must not be toady and forward')),
      nationality: Joi.string(),
      nationalId: Joi.string()
        // eslint-disable-next-line security/detect-unsafe-regex
        .regex(/^[0-9]{13}$|^([a-zA-Z]{2}-[0-9]+)?$/)
        .max(13)
        .allow(null, '')
        .error(new Error('National Id only contains numbers, characters and a hyphen. 13 bit long if contains only digits')),
      phone: Joi.string()
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[0-9]{0,2}?[-\s\.]?[0-9]{2,4}[-\s\.]?[0-9]{3,10}$/)
        .error(new Error('phone number contains digits, hyphens (-) and no spaces are allowed')),
      street: Joi.string().error(new Error('Street contains only characters')),
      city: Joi.string().error(new Error('City contains only characters')),
      state: Joi.string().error(new Error('State contains only character')),
      zipcode: Joi.string()
        .regex(/^[0-9]+(-[0-9]+)?$/)
        .error(new Error('Zipcode can contain only numbers and hyphen')),
      country: Joi.string().error(new Error('Country contains only characters')),
      photo: Joi.string().error(new Error('Only url of photo is stored in database')),
    })
    .min(1),
};

const changePassword = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).error(new Error('Invalid User Id')),
  }),
  body: Joi.object().keys({
    oldPassword: Joi.string().required().custom(password).error(new Error('Invalid Password')),
    newPassword: Joi.string().required().custom(password).error(new Error('Invalid Password')),
  }),
};

const updateApprovalStatus = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId).error(new Error('Invalid User Id')),
  }),
  body: Joi.object()
    .keys({
      approvalStatus: Joi.string().valid('approved', 'pending', 'rejected', 'unapplied').required(),
    })
    .min(1),
};

const updateUserStatus = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      userStatus: Joi.boolean().required(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const shareProfile = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
    })
    .when('query', {
      is: Joi.object().keys({
        medium: Joi.exist().valid('EMAIL'),
      }),
      then: Joi.object({ email: Joi.required() }).required(),
    }),
  query: Joi.object().keys({
    medium: Joi.string().valid('QR', 'EMAIL', 'LINK').required(),
  }),
};

const uploadNidPhoto = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const uploadProfilePhoto = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const uploadPassportPhoto = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const uploadDrivingPhoto = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getPendingUsers,
  getUser,
  updateUser,
  updateApprovalStatus,
  updateUserStatus,
  deleteUser,
  shareProfile,
  changePassword,
  uploadNidPhoto,
  uploadPassportPhoto,
  uploadProfilePhoto,
  uploadDrivingPhoto,
};

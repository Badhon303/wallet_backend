const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

// const fs = require('fs');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    nickName: {
      type: String,
      trim: true,
    },
    nationality: String,
    dob: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    spouseName: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    nidFront: {
      type: String,
      default: 'nid_front.jpg',
    },
    nidBack: {
      type: String,
      default: 'nid_back.jpg',
    },
    passportBiodata: {
      type: String,
      default: 'passport_biodata.jpg',
    },
    drivingFront: {
      type: String,
      default: 'driving_front.jpg',
    },
    drivingBack: {
      type: String,
      default: 'driving_back.jpg',
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be more than 20 characters'],
      unique: [true, 'Duplicate phone number found'],
      sparse: true,
    },
    nationalId: {
      type: String,
      maxlength: [20, 'National id can not be more than 20 characters'],
      // unique: [true, 'duplicate id number found'],
      sparse: true,
    },
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    email: {
      type: String,
      required: [true, 'Please add your email'],
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    emailVerified: {
      type: Boolean,
      required: true,
    },
    termsOfUse: { type: Boolean, required: true },
    password: {
      type: String,
      required: [true, 'please add a password'],
      trim: true,
      minlength: 4,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected', 'unapplied'],
      default: 'unapplied',
    },
    userStatus: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.methods.getShareableData = async function () {
  const user = this;
  return { id: user.id, nickName: user.nickName };
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;

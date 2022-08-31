const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const { paginate, toJSON } = require('./plugins');

const registrationSchema = new mongoose.Schema(
  {
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
    nickName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'please add a password'],
      trim: true,
      private: true, // used by the toJSON plugin
    },
    referrer: {},
    expiaryTime: Date,
  },
  { timestamps: true }
);

registrationSchema.plugin(toJSON);
registrationSchema.plugin(paginate);

registrationSchema.pre('save', async function (next) {
  const registration = this;
  if (registration.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    registration.password = await bcrypt.hash(registration.password, salt);
  }
  next();
});

/**
 * @typedef Registration
 */
const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;

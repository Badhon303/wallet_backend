const httpStatus = require('http-status');
const otpGenerator = require('otp-generator');

const redis = require('./redis');
const ApiError = require('./ApiError');

const generateOtp = async (email) => {
  const otp = otpGenerator.generate(6, { upperCase: true, specialChars: true });
  await redis.setData(email, otp);
  return otp;
};

const matchOTP = async (req, res, next) => {
  const { email } = req.user;
  const { otp } = req.body;

  const cachedOTP = await redis.getData(email);
  if (!cachedOTP) return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `OTP got expired.` });

  if (cachedOTP === otp) {
    console.log(`OTP matched successfully`);
    redis.removeOTP(email);
    next();
  } else return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Provided OTP didnot match.` });
};

module.exports = {
  generateOtp,
  matchOTP,
};

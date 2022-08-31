const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const mlmSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visible_lower_level: {
      type: Number,
      default: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an Integer.',
      },
    },
    visible_upper_level: {
      type: Number,
      default: 1,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an Integer.',
      },
    },
  },
  {
    timestamps: true,
  }
);

mlmSchema.plugin(toJSON);
mlmSchema.plugin(paginate);

/**
 * Checks if a user already has joined to the MLM tree
 * @param {mongoose.Schema.Types.ObjectId} userId
 * @returns {Promise<Boolean>}
 */

// mlmSchema.methods.hasAlreadyJoined = async function (userId) {
//   const userObject = await this.findOne({
//     user: userId,
//   });

//   if (!userObject) {
//     return false;
//   }
//   return true;
// };

/**
 * Returns parentId of provided user.
 * Returns NULL if user has no parent.
 * @param {mongoose.Schema.Types.ObjectId} userId
 * @returns {Promise<mongoose.Schema.Types.ObjectId> || NULL} parentId
 *
 */
// mlmSchema.methods.getParent = async function (userId) {
//   // There might be some error while user is a root
//   let parentId = null;
//   parentId = this.findOne({ user: userId }).select('parent');
//   return parentId;
// };

/**
 * Returns an array of children for provided user.
 * If the user has no children then returns an empty array
 * @param {mongoose.Schema.Types.ObjectId} userId
 * @returns{Array<mongoose.Schema.Types.ObjectId>}
 */
// mlmSchema.methods.getChildren = async function (userId) {
//   let children = [];
//   children = await this.findOne({ user: userId }).select('children');
//   return children;
// };

// mlmSchema.pre('save', async function () {
//   const mlm = this;
//   next();
// });

/**
 * @typedef Mlm
 */
const Mlm = mongoose.model('Mlm', mlmSchema);

module.exports = Mlm;

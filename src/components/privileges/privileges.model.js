const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const privilegeSchema = new mongoose.Schema(
  {
    privilege: { type: String, trim: true, unique: true, required: true },
  },
  {
    timestamps: true,
  }
);

privilegeSchema.plugin(toJSON);
privilegeSchema.plugin(paginate);

/**
 * @typedef Privilege
 */
const Privilege = mongoose.model('Privilege', privilegeSchema);

module.exports = Privilege;

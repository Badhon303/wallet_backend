const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const rolesSchema = new mongoose.Schema(
  {
    role: { type: String, trim: true, required: true },
    privileges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Privilege' }],
  },
  {
    timestamps: true,
  }
);

rolesSchema.plugin(toJSON);
rolesSchema.plugin(paginate);

/**
 * @typedef Roles
 */
const Roles = mongoose.model('Roles', rolesSchema);

module.exports = Roles;

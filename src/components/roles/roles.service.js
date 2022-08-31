const httpStatus = require('http-status');
const Roles = require('./roles.model');
const Privilege = require('../privileges/privileges.model');
const ApiError = require('../../utils/ApiError');

const findAll = async () => {
  const roles = await Roles.find({}).populate({ path: 'privileges', select: 'privilege' });
  return roles;
};

const addNew = async (role, privileges = []) => {
  const newRole = new Roles({ role, privileges });
  await newRole.save();
  return 'New role added.';
};

const getRoleById = async (roleId) => {
  const role = await Roles.findById(roleId).populate({ path: 'priviliges' }).select('role privileges');
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role with given id does not exist.');
  }
  return role;
};

const getPrivilegesByRole = async (role) => {
  if (!role) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role does not exist.');
  }
  let rolePrivileges = await Roles.findOne({ role })
    .populate({ path: 'privileges', select: '-_id privilege' })
    .select('-_id privileges');

  if (!rolePrivileges) {
    rolePrivileges = [];
  } else {
    rolePrivileges = rolePrivileges.privileges.map((obj) => obj.privilege);
  }

  return rolePrivileges;
};

// const updateRole = async (roleId, role) => {
//   await Roles.findById(roleId, function (err, r) {
//     if (err) {
//       throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
//     }

//     r.role = role;
//     r.save();
//   });
//   return 'Role updated successfully.';
// };

const deleteRole = async (roleId) => {
  await Roles.findByIdAndDelete(roleId);
  return 'Role deleted successfully.';
};

const getRolePrivileges = async (roleId) => {
  const role = await Roles.findOne({ _id: roleId }).select('privileges');
  if (!role || !role.privileges) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role has no privilege yet.');
  }
  return role.priviliges;
};

const addRolePrivilege = async (roleId, privilegeId) => {
  const role = await Roles.findById(roleId);
  const privilege = await Privilege.findById(privilegeId);

  if (!role || !privilege) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role/Privilege does not exist.');
  }

  if (role.privileges.some((p) => JSON.stringify(p) === JSON.stringify(privilegeId))) {
    throw new ApiError(httpStatus.CONFLICT, 'Privilege has already been assigned to the role.');
  }

  role.privileges.push(privilege);
  await role.save();

  return 'Privilege added to role successfully.';
};

const removeRolePrivilege = async (roleId, privilegeId) => {
  const role = await Roles.findById(roleId).select('privileges');
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role does not exist.');
  }

  const index = role.privileges.findIndex((obj) => JSON.stringify(obj) === JSON.stringify(privilegeId));
  if (index === undefined || index === null) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role does not have requested privilege.');
  }

  role.privileges.splice(index, 1);
  await role.save();

  return 'Privilege has been removed successfully from role.';
};

module.exports = {
  findAll,
  addNew,
  getRoleById,
  getPrivilegesByRole,
  deleteRole,
  getRolePrivileges,
  addRolePrivilege,
  removeRolePrivilege,
};

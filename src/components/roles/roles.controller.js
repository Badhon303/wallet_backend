const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const rolesService = require('./roles.service');

const getAll = catchAsync(async (req, res) => {
  const roles = await rolesService.findAll();
  return res.status(httpStatus.OK).json(roles);
});

const createNewRole = catchAsync(async (req, res) => {
  const { role, privileges } = req.body;
  const msg = await rolesService.addNew(role, privileges);
  return res.status(httpStatus.CREATED).json({ msg });
});

const getRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const role = await rolesService.getRoleById(roleId);
  return res.status(httpStatus.OK).json(role);
});

const updateRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const { role } = req.body;
  const msg = await rolesService.updateRole(roleId, role);
  return res.status(httpStatus.OK).json({ msg });
});

const deleteRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const msg = await rolesService.deleteRole(roleId);
  return res.status(httpStatus.OK).json({ msg });
});

const getRolePrivileges = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const rolePrivileges = rolesService.getRolePrivileges(roleId);
  return res.status(httpStatus.OK).json(rolePrivileges);
});

const addRolePrivilege = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const { privilegeId } = req.body;
  const msg = await rolesService.addRolePrivilege(roleId, privilegeId);
  return res.status(httpStatus.OK).json({ msg });
});

const deleteRolePrivileges = catchAsync(async (req, res) => {
  const { roleId, privilegeId } = req.params;
  const msg = await rolesService.removeRolePrivilege(roleId, privilegeId);
  return res.status(httpStatus.OK).json({ msg });
});

module.exports = {
  getAll,
  createNewRole,
  getRole,
  updateRole,
  deleteRole,
  getRolePrivileges,
  addRolePrivilege,
  deleteRolePrivileges,
};

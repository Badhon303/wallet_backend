const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const privilegeService = require('./privileges.service');

const getAllPrivileges = catchAsync(async (req, res) => {
  const privileges = await privilegeService.findAll();
  return res.status(httpStatus.OK).json(privileges);
});

const addNewPrivilege = catchAsync(async (req, res) => {
  const { privilege } = req.body;
  const msg = await privilegeService.addNew(privilege);
  return res.status(httpStatus.CREATED).json({ msg });
});

module.exports = { getAllPrivileges, addNewPrivilege };

const roles = ['user', 'admin', 'wolf_owner', 'eagle_owner', 'snow_owner', 'btc_owner', 'eth_owner', 'bank_owner'];

const roleRights = new Map();
roleRights.set(roles[0], [
  'getReferrer',
  'shareUserProfile',
  'getRolePrivileges',
  'updateOwnAccount',
  'getBalance',
  'getUser',
]);
roleRights.set(roles[1], [
  'getUsers',
  'updateUser',
  'manageUsers',
  'manageMlmTree',
  'getReferrer',
  'shareUserProfile',
  'getAllPrivileges',
  'addNewPrivilege',
  'getAllRoles',
  'createNewRole',
  'deleteRole',
  'getRole',
  'getRolePrivileges',
  'addRolePrivilege',
  'deleteRolePrivileges',
  'updateOwnAccount',
  'getBalance',
  'performTransaction',
]);
roleRights.set(roles[2], ['purchase_eagle_or_snow', 'exchange']);
roleRights.set(roles[3], ['shareholder']);
roleRights.set(roles[4], ['shareholder']);
roleRights.set(roles[5], ['purchase_wolf_with_btc']);
roleRights.set(roles[6], ['purchase_wolf_with_eth']);
roleRights.set(roles[7], ['purchase_wolf_with_currency']);

module.exports = {
  roles,
  roleRights,
};

const Privilege = require('./privileges.model');

const findAll = async () => {
  const privileges = Privilege.find({}).select('privilege');
  return privileges;
};
const addNew = async (privilege) => {
  const newPrivilege = new Privilege({ privilege });
  const result = await newPrivilege.save();
  return result;
};

module.exports = {
  findAll,
  addNew,
};

var mongoose = require('mongoose');

var UsersToRolesSchema = new mongoose.Schema({
	userId: { type: String, default: '' },
	roleId: { type: String, default: '' }
});

var UsersToRoles = mongoose.model('UsersToRoles', UsersToRolesSchema);

module.exports = UsersToRoles;
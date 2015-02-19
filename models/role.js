var mongoose = require('mongoose');

var RoleSchema = new mongoose.Schema({
	name: { type: String, default: '' }
});

var Role = mongoose.model('Role', RoleSchema);

module.exports = Role;
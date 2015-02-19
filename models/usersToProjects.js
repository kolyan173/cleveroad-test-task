var mongoose = require('mongoose');

var UsersToProjectsSchema = new mongoose.Schema({
	userId: { type: String, default: '' },
	projectId: { type: String, default: '' }
});

var UsersToProjects = mongoose.model('UsersToProjects', UsersToProjectsSchema);

module.exports = UsersToProjects;
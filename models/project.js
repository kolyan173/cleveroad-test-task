var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
	name: { type: String, default: '' },
	description: { type: String, default: '' },
	update: { type: Date, default: Date.now},
	create: { type: Date, default: Date.now}
});

var Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;

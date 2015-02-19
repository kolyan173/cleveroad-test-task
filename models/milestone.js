var mongoose = require('mongoose');

var MilestoneSchema = new mongoose.Schema({
	name: { type: String, default: '' },
	complete: { type: Number, default: '' },
	projectId: { type: String, default: '' },
	number: { type: Number, default: '' },
	update: { type: Date, default: Date.now },
	create: { type: Date, default: Date.now },
});

var Milestone = mongoose.model('Milestone', MilestoneSchema);

module.exports = Milestone;
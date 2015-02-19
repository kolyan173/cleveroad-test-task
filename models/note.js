var mongoose = require('mongoose');

var NoteSchema = new mongoose.Schema({
	milestoneId: { type: String, default: '' },
	update: { type: Date, default: Date.now},
	create: { type: Date, default: Date.now},
	userId: { type: String, default: '' },
	note: { type: String, default: '' }
});

var Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
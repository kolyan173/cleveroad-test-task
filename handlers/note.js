var Note = require('../models/note');
var Milestone = require('../models/milestone');
var User = require('../models/user');
var async = require('async');
exports.notelist = function (req, res, next) {
	async.waterfall([
		function (done) {
			Note.find(function(err, notes) {
				if(err) return next(err);
				var context = {
					title: 'Notes',
					userIds: notes.map(function(note) {return note.userId}),
					milestoneIds: notes.map(function(note) {return note.milestoneId}),
					notes:  notes.map(function(note) {
								return {
									id: note._id,
									note: note.note,
									create: note.create,
									update: note.update
								};
							})
				};
				done(err, context);
			});
		}, function (context, done) {
			async.map(context.userIds, function(userid, cb) {
				User.findById(userid, function(err, user) {
					cb(null, user);
				});
			},function(err, users) {
				delete context.userIds;
				context.notes.forEach(function(note, i) {
					context.notes[i].user = users[i] && users[i].username 
											|| users[i];
				});
				done(err, context);
			});
		}, function (context, done) {
			async.map(context.milestoneIds, function(milestoneid, cb) {
				Milestone.findById(milestoneid, function(err, milestone) {
					cb(null, milestone);
				});
			},function(err, milestones) {
				delete context.milestoneIds;
				context.notes.forEach(function(note, i) {
					context.notes[i].milestone = milestones[i] && milestones[i].name 
											|| milestones[i];
				});
				done(err, context);
			});
		}
	], function (err, context) {
		if(err) next(err);
		return res.render('noteslist', context);
	})
};
exports.noteview = function(req, res, next) {
	Note.findById(req.params.id, function(err, note) {
		if(err) return next();
			var context = {
				title: 'Note card',
				postfix: '/edit',
				milestones: Milestone.find(),
				note: {
							id: note._id,
							note: note.note || 'no_note',
							user: note.userId && User.findById(note.userId),
							milestone: note.milestoneId && Milestone.findById(note.milestoneId),
							create: note.create,
							update: note.update
						}
			};
		return res.render('notecard', context);
	});
};
exports.noteedit = function(req, res, next) {
	Note.findById(req.params.id, function(err, note) {
		if(err) console.log(err);
		var context = {
			title: 'Note\'s card',
			edit: true,
			postfix: '/edit',
			users: User.find(),
			milestones: Milestone.find(),
			note: {
						id: note._id,
						note: note.note,
						user: note.userId && User.findById(note.userId),
						milestone: note.milestoneId && Milestone.findById(note.milestoneId),
					 }
		};
		return res.render('notecard', context);
	});
};
exports.noteupdate = function(req, res, next) {
	console.log('note update MAIN', req.params);
	Note.findByIdAndUpdate(req.params.id, req.body, function(err, note) {
		if(err) return next();
		note.update = Date.now()
		note.save(function(err) {
			return res.redirect(303, '/notes/' + note._id);
			
		});
	});	
};
exports.addnote = function(req, res) {
	return new Note(req.body).save(function(err) {
		return res.redirect(303, '/notes/list');
	});
};
exports.addnoteView = function(req, res) {
	var context = {
		title: 'New note',
		note: {},
		milestones: Milestone.find(),
		users: User.find()
	};
	res.render('newnote', context);
};
exports.removenote = function(req, res) {
	Note.remove({ _id: req.params.id }, function(err, note) {
		return res.redirect('/notes/list');
	});
};

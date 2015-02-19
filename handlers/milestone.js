var Milestone = require('../models/milestone');
var Project = require('../models/project');
var async = require('async');

exports.milestoneslist = function(req, res) {
	async.waterfall([
		function (done) {
			Milestone.find(function(err, milestones) {
				if (err) console.log(err);
				var context = {
					title: 'Milestone list',
					postfix: '',
					projectIds: milestones.map(function(milestone) {
									return milestone.projectId;
								}),
					milestones: milestones.map(function(milestone) {
									return {
										id: milestone._id,
										name: milestone.name,
										complete: milestone.complete,
										number: milestone.number
									}
								})
				};
				done(err, context);
			});
			
		}, function (context, done) {
			async.map(context.projectIds, function(projectid, cb) {
				Project.findById(projectid, function(err, project) {
					cb(null, project);
				});
			},function(err, projects) {
				delete context.projectIds;
				context.milestones.forEach(function(note, i) {
					context.milestones[i].project = projects[i] && projects[i].name 
											|| projects[i];
				});
				done(err, context);
			});
		}
	], function (err, context) {
		if(err) next(err);
		return res.render('milestoneslist', context);
	});
};
exports.milestoneview = function(req, res, next) {
		Milestone.findById(req.params.id, function(err, milestone) {
		if(err) return next(err);
			var context = {
			title: 'Milestone card',
			postfix: '/edit',
			milestone: {
				id: milestone._id,
				name: milestone.name,
				complete: milestone.complete,
				project: milestone.projectId 
							&& Project.findById(milestone.projectId),
				number: milestone.number,
				create: milestone.create,
				update: milestone.update
			} 
		};
		return res.render('milestonecard', context);
	});
};
exports.milestoneedit = function(req, res, next) {
	Milestone.findById(req.params.id, function(err, milestone) {
		if(err) console.log(err);
		var context = {
			title: milestone.name + ' milestone\'s card',
			edit: true,
			postfix: '/edit',
			milestone: {
						id: milestone._id,
						name: milestone.name,
						complete: milestone.complete,
						number: milestone.number
					 }
		};
		return res.render('milestonecard', context);
	});
};
exports.milestoneupdate = function(req, res, next) {
	Milestone.findByIdAndUpdate(req.params.id, req.body, function(err, milestone) {
		if(err) return next();
		// for (var key in req.body) {
		// 	milestone[key] = req.body[key];
		// }
		milestone.save(function(err, milestone) {
			console.log('milestone', milestone);
			return res.redirect(303, '/milestones/' + milestone._id);
			
		});
	});	

};
exports.addmilestone = function(req, res) {
	console.log('addProject');
	return new Milestone(req.body).save(function(err) {
		return res.redirect(303, '/milestones/list');
	});
};
exports.addmilestoneView = function(req, res) {
	var context = {
		title: 'New milestone',
		milestone: {},
		projects: Project.find()
	};
	res.render('newmilestone', context);
};
exports.removemilestone = function(req, res) {
	console.log('req', req.params);
	Milestone.remove({ _id: req.params.id }, function(err, milestone) {
		return res.redirect('/milestones/list');
	});
};
var Project = require('../models/project');
var controller = ('./controllers/main');

exports.projectslist = function(req, res) {
	Project.find(function(err, projects) {
		var context = {
			title: 'Projects',
			projects: projects.map(function(project) {
				return {
					id: project._id,
					name: project.name,
					create: project.create,
					update: project.update,
					description: project.description				
				};
			})
		};
		res.render('projectslist', context);
	});
};
exports.projectview = function(req, res) {
	Project.findOne({_id: req.params.id}, function(err, project) {
		if(err) console.log(err);
		var context = {
			title: project.name + ' project\'s card',
			postfix: '',
			project: {
						id: project._id,
						name: project.name,
						description: project.description,
					 }
		};
		return res.render('projectcard', context);
	});
};
exports.projectedit = function(req, res, next) {
	Project.findById(req.params.id, function(err, project) {
		if(err) console.log(err);
		var context = {
			title: project.name + ' project\'s card',
			edit: true,
			postfix: '/edit',
			project: {
						id: project._id,
						name: project.name,
						description: project.description,
					 }
		};
		return res.render('projectcard', context);
	});
};
exports.projectupdate = function(req, res, next) {
	Project.findByIdAndUpdate(req.params.id, req.body, function(err, project) {
		if(err) return next();
		// for (var key in req.body) {
		// 	project[key] = req.body[key];
		// }
		// project.save(function(err, project) {
		project.save(function(err) {
			return res.redirect(303, '/projects/projectcard/' + project._id);
			
		});
	});	
};
exports.addproject = function(req, res) {
	console.log('addProject');
	return new Project(req.body).save(function(err, project) {
		// var context = {
		// 	title: 'Projects',
		// 	project: projects.map(function(project) {
		// 		return {
		// 			id: project._id,
		// 			name: project.name,
		// 			create: project.create,
		// 			update: project.update,
		// 			description: project.description				
		// 		};
		// 	})
		// };
		return res.redirect(303, '/projects/list');
	});
};
exports.addprojectView = function(req, res) {
	var context = {
		title: 'New project',
		project: {}
	};
	res.render('newproject', context);
};
exports.removeproject = function(req, res) {
	Project.remove({ _id: req.params.id }, function(err, project) {
		return res.redirect('/projects/list');
	});
};
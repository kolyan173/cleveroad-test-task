
var User = require('../models/user'),
	City = require('../models/city'),
	UsersToProjects = require('../models/usersToProjects'),
	Project = require('../models/project'),
	credentials = require('../credentials'),
	emailService = require('../lib/email')(credentials),
	passport = require('passport'),
	async = require('async'),
	crypto = require('crypto');

exports.index = function(req, res) {
	return res.render('index', { 
		title: 'The index page!'
	});
};
exports.home = function(req, res, next) {
	if(req.params.userId === 'list') return next();
	// if(req.params.userId.match 'list') return next();
	return res.render('home', {
		title: 'Home',
		username: req.params.userId
	});
};
exports.login = function(req, res) {
	return res.render('login', { 
		title: 'Log In',
		user: req.user,
		error: req.flash('error'),
		message: req.flash('info')
	});
};
exports.logout = function(req, res) {
	req.logout();
	return res.redirect('/');
};
exports.load = function(req, res, next, id) {
	var options;;
	if (id === 'list') {
		options = null;
	} else {
		options = { criteria: { username: id } };
	}
	User.load(options, function (err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + id));
		req.loaded = user;
		console.log(user);
		next();
	});
};
exports.signup = function(req, res) {
	var context = {
		title: 'Sign up',
		user: new User,
		cities: City.find()
	};
	return res.render('signup', context);
};
exports.userslist = function(req, res) {
	async.waterfall([
		function (done) {
			User.find(function(err, users) {
				var context = {
					title: 'Users',
					cityIds: users.map(function(user) {return user.cityId}),
					users: users.map(function(user) {
						return  {
							id: user._id,
							name: user.firstName || 'no_name',
							lastName: user.lastName || 'no_lastName',
							email: user.email || 'no_email',
							create: user.create,
							update: user.update
									
						};
					})
				};
				done(err, context);
			});			
		}, function (context, done) {
			async.map(context.cityIds, function(cityid, cb) {
				City.findById(cityid, function(err, city) {
					cb(null, city);
				});
			},function(err, users) {
				delete context.cityIds;
				context.users.forEach(function(note, i) {
					context.users[i].city = users[i] && users[i].name 
											|| users[i];
				});
				done(err, context);
			});				
		}
	], function (err, context) {
		if(err) next(err);
		return res.render('userslist', context);
	});
};
exports.resetpass = function(req, res, next) {
	async.waterfall([
	    function(done) {
			crypto.randomBytes(20, function(err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
	    },
	    function(token, done) {
			User.findOne({ email: req.body.email }, function(err, user) {
				if (!user) {
					req.flash('error', 'No account with that email address exists.');
					return res.redirect('/restore_pass');
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
				user.save(function(err) {
					done(err, token, user);
				});
			});
	    },
	    function(token, user, done) {
			emailService.send(
				user.email,
				'Restored password',
				'Please click on the following link: http://' 
				+ req.headers.host + '/restorepass/' + token,
				function(err, info) {
					done(err);
				}
			);
	    }
	], function(err) {
	    if (err) {
	    	req.flash('error', err);
	    	return next(err);
    	}
    	req.flash('info', 'Check your email and follow the link!!!');
		return res.redirect('/login');
  });
};
exports.preRestorePass = function(req, res) {
	return res.render('restore_pass', {
		title: 'Restoring password',
		error: req.flash('error'),
		message: req.flash('info')
	});
};
exports.restorePassword = function(req, res, next) {
	User.findOne(
		{	
		  	resetPasswordToken: req.params.token,
		  	resetPasswordExpires: { $gt: Date.now() } 
		}, 
	  	function(err, user) {
			if (!user) {
			  req.flash('error', 'Password reset token is invalid or has expired.');
			  return res.redirect('/restore_pass');
			}
			var context = {
				title: 'Enter new password',
				error: req.flash('error'),
				user: {
						resetPasswordToken: user.resetPasswordToken
					}
			};
			res.render('resetpass', context);
		}
	);
};
exports.passrestoring = function(req, res, next) {
	async.waterfall([
		function(done) {
			User.findOne(
				{ 
					resetPasswordToken: req.params.token, 
					resetPasswordExpires: { $gt: Date.now() } 
				}, 
				function(err, user) {
					if (!user) {
						req.flash('error', 'Password reset token is invalid or has expired.');
						return res.redirect('back');
					}
					if(req.body.password !== req.body.confirm) {
						req.flash('error', 'Passwords in two fields mismatches.');
						return res.redirect('back');
					}
					user.password = req.body.password;
					user.resetPasswordToken = undefined;
					user.resetPasswordExpires = undefined;

					user.save(function(err) {
						req.logIn(user, function(err) {
						done(err, user);
					});
				});
			});
		},
		function(user, done) {
			emailService.send(
				user.email,
				'Restoring password proccess',
				'Password for ' + user.email + 'restored successfully',
				function(err, info) {
					done(err);
				}
			);
	    }
	], function(err) {
		if(err) {
			req.flash('error', err);
			return next(err);
		}
		req.flash('info', 'Your password restore! Please, try login again');
 		return res.redirect('/login');
	});
};
exports.authorization = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) { return next(err) }
		if (!user) {
			req.flash('error', info.error);
			return res.redirect('/login')
		}
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			return res.redirect('/home');
		});
	})(req, res, next);
};
exports.userview = function(req, res) {
	var userid = req.params.id;
	var context = {};
	async.waterfall([
		function (done) {
			User.findById( userid, function(err, user) {
				if(err) return next(err);
				context.title = user.username + '\'s card';
				context.user = {
					id: user._id,
					username: user.username,
					lastName: user.lastName,
					firstName: user.firstName,
					email: user.email,
					city: user.cityId
				};
				done(err, context);
			});
		}, function (context, done) {
			var cityid = context.user.city; 
			City.findById( cityid, function(err, city) {
				if(err) return next(err);
				context.user.city = city.name;
				done(err,context);
			});
		}, function (context, done) {
			UsersToProjects.find({ userId: userid }, function (err, projects) {
				if(err) return next(err);
				context.projects = projects;
				done(err, context);
			});
		}, function (context, done) {
			context.projects = 
				context.projects.map(function(project) {
					return project.projectId;
				});
			
			Project.find({ 
				_id: { $in: context.projects } 
			}, 
			function (err, projects) {
				context.projects = 
					projects.map(function(project) {
						return project.name;
					});
				// context.user.city = context.user.city.name;
				done(err, context);
			});
		}
	], function(err, context) {
		return res.render('usercard', context);
	});
};
exports.adduser = function(req, res, next) {
	return new User(req.body).save(function() {
		res.redirect(303, '/login');
	});
};
exports.removeuser = function(req, res, next) {
	User.remove({ _id: req.params.id }, function(err, user) {
		res.redirect('/users/list');
	});
};

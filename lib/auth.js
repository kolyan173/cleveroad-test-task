var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport){

	passport.serializeUser(function(user, done){
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			if(err || !user) return done(err, null);
			done(null, user);
		});
	});

	passport.use(new LocalStrategy(function(username, password, done) {
		process.nextTick(function() {
			User.findOne({ username: username }, function (err, user) {
				if (err) { return done(err); }
				if (!user) { 
					return done(null, false, { 
						message: 'There is no such user'
					}); 
				}
				if (!user.authenticate(password)) { 
					return done(null, false, {
						message: 'А с паролем то как-то не получилось!'
					}); 
				}
				return done(null, user);
			});
		});
	}));
};
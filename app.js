var express = require('express'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	mongoose = require('mongoose'),
	ejs = require('ejs'),
	expressLayouts = require('express-ejs-layouts'),
	fs = require('fs'),
	passport = require('passport'),
	flash = require('connect-flash'),
	promise = require('express-promise'),
	methodOverride = require('method-override'),
	crypto = require('crypto'),
	bcrypt = require('bcrypt'),
	async = require('async'),

	Note = require('./models/note'),
	Project = require('./models/project'),
	Milestone = require('./models/milestone'),
	UsersToRole = require('./models/usersToRole'),
	User = require('./models/user'),
	Role = require('./models/role'),
	UsersToRole = require('./models/usersToRole'),
	UsersToProjects = require('./models/usersToProjects'),
	localsBuilder = require('./controllers/localPropsBuilder'),
	app = express();
	
	var credentials = require('./credentials');
	
var connect = function () {
	var options = { server: { socketOptions: { keepAlive: 1 } } };
	mongoose.connect(credentials.mongo.connectionString, options);
	mongoose.connection.on('error', console.log);
	mongoose.connection.on('disconnected', connect);
};
connect();

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(methodOverride(function(req, res) {
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		var method = req.body._method
		delete req.body._method
		return method
	}
}));

require('./lib/auth')(passport);

app.use(cookieParser('secret'));
app.use(session('credentials.cookieSecret'));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(promise());

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function(){
	console.log('Server Started');
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('layout', 'layout');

app.use(function(req, res, next) {
	localsBuilder(app);
	app.locals.isLogged = req.isAuthenticated();
	if(!app.locals.isLogged) app.locals.userrole = 'noauth';

	if(!req.session.passport.user && req.path === '/home') {
		req.flash('error', 'You have to log in firstly');
		return res.redirect('/login');
	} else {
		UsersToRole.findOne({ userId: req.session.passport.user}, function(err, role) {
			if(err || !role) return next(err);
			Role.findById(role.roleId, function(err, role) {
				if(err || !role) return next();
				req.session.userrole = role.name;
				app.locals.userrole = role.name;			
				next();
			});
		});
	}
});

app.use(expressLayouts);

require('./routes.js')(app);

app.use(function(req, res, next){
	res.status(404);
	res.render('404', { title: '' });
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500', { title: '' });
});


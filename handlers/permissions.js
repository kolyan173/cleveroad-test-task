module.exports = {
	authorized: function (req, res, next) {
		if(req.isAuthenticated()) return next();
		res.redirect('/');
		// next('route');
	},
	onlyadmin: function (req, res, next) {
		if(req.session.userrole === 'Admin') {
			return next();
		}
		res.redirect('/');
		// next('route');
	},
	onlyClientOrManager: function (req, res, next) {
		if(~'Manager Client'.indexOf(req.session.userrole)) {
			return next();
		}
		res.redirect('/');
		// next('route');
	}
};
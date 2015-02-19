
var user = require('./handlers/user'),
	city = require('./handlers/city'),
	project = require('./handlers/project'),
	note = require('./handlers/note'),
	milestone = require('./handlers/milestone'),
	permissions = require('./handlers/permissions');

module.exports = function(app) {
	app.get('/', user.index);
	app.get('/login', user.login);
	app.get('/logout', user.logout);
	app.get('/signup', user.signup);
	app.post('/auth', user.authorization);

	app.post('/adduser', user.adduser);
	app.get('/home', user.home);
	app.param('userId', user.load);
	app.get('/users/list', permissions.onlyadmin, user.userslist);
	app.delete('/api/removeuser/:id', user.removeuser);

	app.get('/restore_pass', user.preRestorePass);
	app.post('/restore_pass', user.resetpass);
	app.get('/restorepass/:token', user.restorePassword);
	app.post('/restorepass/:token', user.passrestoring);

	app.get('/users/usercard/:id', user.userview);
	
	app.get('/projects/list', project.projectslist);
	app.put('/projects/projectcard/:id/edit',
		permissions.onlyClientOrManager,
		project.projectupdate
	);
	app.get('/projects/projectcard/:id', 
		permissions.authorized,
		project.projectview
	);
	app.get('/projects/projectcard/:id/edit', 
		permissions.onlyClientOrManager,
		project.projectedit
	);
	app.post('/api/newproject',
		permissions.onlyClientOrManager,
		project.addproject);
	app.get('/projects/newproject',
		permissions.onlyClientOrManager,
		project.addprojectView
	);
	app.delete('/api/removeproject/:id',
		permissions.authorized,
		project.removeproject
	);
	

	app.get('/milestones/list', milestone.milestoneslist);
	app.put('/milestones/:id/edit',
		permissions.onlyClientOrManager,
		milestone.milestoneupdate
	);
	app.get('/milestones/:id/edit',
		permissions.onlyClientOrManager,
		milestone.milestoneedit
	);
	app.post('/api/newmilestone',
		permissions.onlyClientOrManager,
		milestone.addmilestone
	);
	app.get('/milestones/newmilestone',
		permissions.onlyClientOrManager,
		milestone.addmilestoneView
	);
	app.get('/milestones/:id',
		permissions.authorized,
		milestone.milestoneview
	);
	app.delete('/api/removemilestone/:id',
		permissions.authorized,
		milestone.removemilestone
	);

	app.get('/notes/list', note.notelist);
	app.put('/notes/:id/edit',
		permissions.onlyClientOrManager,
		note.noteupdate
	);
	app.get('/notes/:id/edit',
		permissions.onlyClientOrManager,
		note.noteedit
	);
	app.post('/api/newnote',
		permissions.onlyClientOrManager,
		note.addnote
	);
	app.get('/notes/newnote',
		permissions.onlyClientOrManager,
		note.addnoteView
	);
	app.get('/notes/:id',
		permissions.authorized,
		note.noteview
	);
	app.delete('/api/removenote/:id',
		permissions.authorized,
		note.removenote
	);
};


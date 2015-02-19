var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true, },
	email: { type: String, required: true, unique: true, },
	hashed_password: { type: String, required: true },
	// password: { type: String, required: true },
	salt: { type: String, default: '' },
	cityId: { type: String, default: ''},
	firstName: { type: String, default: ''},
	lastName: { type: String, default: ''},
	update: { type: Date, default: Date.now },
	create: { type: Date, default: Date.now },
	resetPasswordToken: String,
  	resetPasswordExpires: Date
});

UserSchema.virtual('password')
	.set(function(password) {
		this._password = password;
		this.salt = this.makeSalt();
		this.hashed_password = this.encryptPassword(password);
	}).get(function() { 
		return this._password 
	});

// UserSchema.pre('save', function(next) {
// 	var user = this;
// 	var SALT_FACTOR = 5;
// 	// user.password = 'TEST';
// 	// if (!user.isModified('password')) return next();

// 	// // bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
// 	// 	// if (err) return next(err);
// 	// 	bcrypt.hash(user.password, '$2a$05$85GaO.RrnBABnxbxWabK1O', function(err, hash) {
// 	// 		if (err) return console.log(err); next(err);
// 	// 		console.log('bcrypt. hash', hash);
// 	// 		user.password = hash;
// 	// 		// user.set('password', hash);
// 	// 		console.log('user', user);
// 			next();
// 	// 	});
// 	// });
// });

UserSchema.methods = {
	makeSalt: function () {
		return Math.round((new Date().valueOf() * Math.random())) + '';
	},
	encryptPassword: function (password) {
		if (!password) return '';
		try {
			return crypto
				.createHmac('sha1', this.salt)
				.update(password)
				.digest('hex');
		} catch (err) {
			return '';
		}
	},   
	authenticate: function (plainText) {
		return this.encryptPassword(plainText) === this.hashed_password;
	}
};

UserSchema.statics = {
	load: function (options, cb) {
		if(!options) {
			return this.find().exec(cb);
		}
		options.select = options.select || 'name username';
		this.findOne(options.criteria)
		.select(options.select)
		.exec(cb);
	}
};

var User = mongoose.model('User', UserSchema);

module.exports = User;
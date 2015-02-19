var mongoose = require('mongoose');

var CitySchema = new mongoose.Schema({
	name: { type: String, default: '' }
});

CitySchema.statics = {
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
var City = mongoose.model('City', CitySchema);

module.exports = City;
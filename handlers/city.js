var City = require('../models/city');

exports.citieslist = function(req, res) {
	City.find(function(err, cities) {
		if (err) console.log(err);
		var context = {
			title: 'Cities',
			cities:  cities.map(function(city) {
						return {
							name: city.firstName || 'no_name'
						};
					})
		};
		return res.render('citieslist', context);
	});
};

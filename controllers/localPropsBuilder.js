var properties = {
	value: '',
	disabled: false,
	error: [],
	message: [],
	inputType: 'text',
	attributes: '',
	placeholder: '',
	btnText: 'Save',
	userrole: 'noauth',
	edit: undefined
};
module.exports = function (app) {
	for(var i in properties) {
		if(!app.locals[i]) {
			app.locals[i] = properties[i];
		}
	}
};

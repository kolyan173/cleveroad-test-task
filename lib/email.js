var nodemailer = require('nodemailer');
// var smtpTransport = require('nodemailer-smtp-transport');

module.exports = function(credentials) {

    return {
        send: function(to, subj, text, cb) {
        	var transporter = nodemailer.createTransport({
        		service: 'Gmail',
        		auth: {
                    user: credentials.gmail.user,
                    pass: credentials.gmail.password
        		}
        	});
            var opts = {
                from: 'Cleveroad Test Task <' + 'kolyan173@gmal.com' + '>',
                to: to,
                subject: subj,
                text: text
            };
            return transporter.sendMail(opts, function(error, info){
                if(error){
                    console.log(info, error);
				}else{
					console.log('Message sent: ' + info.response);
				}
                transporter.close();
                if(cb) cb(error, info);
            });
        }
    };

};

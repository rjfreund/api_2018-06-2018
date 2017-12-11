var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var db = require('../../database/connection-knex-postgresql');
var validateSchema = require('../../database/utils/validateSchema');

module.exports = function() {
	var opts = {}
	opts.jwtFromRequest = ExtractJwt.fromBodyField("token");
	opts.secretOrKey = 'imasecretkey';
	//opts.issuer = "api.rjfreund.com";
	opts.passReqToCallback = true;

	passport.use(new JwtStrategy(opts, function (request, jwt_payload, done) {
		validateSchema(request.params.schemaName)
			.then(function (schemaName) {
				return db.select()
					.from("users")
					.where({id: jwt_payload.sub});
			}).then(function (users) {
			if (users.length > 1) {
				done("Too many users returned from this id.", false);
			}
			var user = users[0];
			console.log(user);
			done(null, user);
		}).catch(function (error) {
			console.log(error);
			done(error, false);
		});
	}));
}();
var db = require('../../database/connection-knex-postgresql');
var validateSchema = require('../../database/utils/validateSchema');
var jwt = require('jsonwebtoken');
var jwtConfig = require('./jsonwebtoken-config');

module.exports = function(req, res, next) {
	if (!req.header("Authorization")){ res.status(511).send("Authorization token not found. Action cancelled."); return;}
	var token = req.header("Authorization").replace("Bearer ", "");
	jwt.verify(token, jwtConfig.secret, function(err, decoded){
		if (err){ res.status(511).send("No users found with email and password."); return; }
		validateSchema(req.schemaName || req.params.schemaName)
		.then(function (schemaName) {
			return db.select()
				.from("users")
				.withSchema(schemaName)
				.where({id: decoded.sub});
		}).then(function success(users) {
			if (users.length > 1) { res.status(500).json({ error: "Too many users returned from this id. Action cancelled.", isTokenValid: false }); }
			req.user = users[0];
			next();
		}, function fail(error) {
			res.json({ error: error, isTokenValid: false });
		});
	});
};
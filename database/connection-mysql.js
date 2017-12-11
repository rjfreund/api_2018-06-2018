var mysql = require('mysql');
var Q = require('q');

module.exports = function(){
	var self = this;
	var pool = mysql.createPool(getConnectionConfig());
	this.setDB = function(inputDB){
		var deferred = Q.defer();
		try{
			pool = mysql.createPool(getConnectionConfig(inputDB));
			deferred.resolve(inputDB)
		}
		catch(err){
			console.error(err);
			deferred.reject(new Error("unable to create database connection"))
		}
		return deferred.promise;
	};
	this.config = function(connectionConfig){ pool = mysql.createPool(connectionConfig); };
	this.query = function(queryString, params, isIncludeOutputFields){
		params = params || {};

		var deferred = Q.defer();

		pool.getConnection(function(err, connection){
			if (err){
				console.error(err);
				if (connection){
					connection.release();
				}
				deferred.reject(new Error(err));
				return;
			}
			connection.query(queryString, params, function(err){
				if (err){
					console.error(err);
					if (connection){
						connection.release();
					}
					deferred.reject(new Error(err));
					return;
				}
				if (isIncludeOutputFields){
					deferred.resolve([].splice.call(arguments, 1));
					connection.release();
					return;
				}
				deferred.resolve([].splice.call(arguments, 1)[0]); //only display the rows, and not fields
				connection.release();
			});
		});

		return deferred.promise;
	};
	this.config = pool.config;
	this.escape = pool.escape;
	this.escapeId = pool.escapeId;

	return this;

	function getConnectionConfig(db){
		var connectionConfig;
		if (!process.env.OPENSHIFT_MYSQL_DB_USERNAME ||
			!process.env.OPENSHIFT_MYSQL_DB_PASSWORD){
			var localConnectionConfig = {
				host: '127.0.0.1',
				user: 'adminTEcDAGF',
				password: 'JA6lE2Ypqsju',
				port: '3306'
			}
			if (db) {localConnectionConfig.database = db}
			connectionConfig = localConnectionConfig;
			return connectionConfig;
		}
		var openshiftConnectionConfig = {
			host: process.env.OPENSHIFT_MYSQL_DB_HOST,
			user: process.env.OPENSHIFT_MYSQL_DB_USERNAME,
			password: process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
			port: process.env.OPENSHIFT_MYSQL_DB_PORT /*,
			database: process.env.OPENSHIFT_APP_NAME */
		};
		if (db) {openshiftConnectionConfig.database = db}
		connectionConfig = openshiftConnectionConfig;
		return connectionConfig;
	}
}();
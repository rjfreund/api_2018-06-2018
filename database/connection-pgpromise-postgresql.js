var promise = require('q');
var options = {
	promiseLib: promise
};
var pgpromise = require('pg-promise')(options);
var dbName = require('./databaseName');

var localConnectionConfig = {
	host: process.env.OPENSHIFT_POSTGRESQL_DB_HOST || 'localhost', // server name or IP address;
	port: process.env.OPENSHIFT_POSTGRESQL_DB_PORT || 5432,
	database: dbName,
	user: process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME || 'adminz9bkxe1',
	password: process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || 'f_TaFpdiJjw7'
};
// alternative:
// var cn = "postgres://adminlumqhry:RVtel-bBCa89@localhost:5432";

var db = pgpromise(localConnectionConfig); // database instance;

module.exports = db;
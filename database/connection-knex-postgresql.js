var dbName = require('./databaseName');

var knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.OPENSHIFT_POSTGRESQL_DB_HOST || 'localhost', // server name or IP address;
	port: process.env.OPENSHIFT_POSTGRESQL_DB_PORT || 5432,
	database: dbName,
	user: process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME || 'adminz9bkxe1',
	password: process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || 'f_TaFpdiJjw7'
  }
});

module.exports = knex;
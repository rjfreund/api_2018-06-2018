var validateSchema = require('../utils/validateSchema');
var db = require("../connection-knex-postgresql");
var describe = function(schemaName, tableName){
    return validateSchema(schemaName)
    .then(function(schemaName){
        return db.table(tableName)
        .withSchema(schemaName)
        .columnInfo();
    });
};
/*
router.get('/:schemaName/:tableName/describe', function getTableDescription(req, res, next) {
    //Also, knex(req.tableName).columnInfo() doesn't return anything for some reason...
    db.select()
    .from("information_schema.columns")
    .where({ table_name: req.params.schemaName })
    .then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});
*/

/*
router.get('/:schemaName/:tableName/describe', function getFilteredRecords(req, res, next) {
    validateSchema(req.params.schemaName)
    .then(function(schemaName){
        return db.select()
        .from("information_schema.columns")
        .where({ table_name: 'categories' });
    }).then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        res.status(500).json(err);
    }).done();
});
*/

module.exports = describe;
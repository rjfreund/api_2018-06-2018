var express             = require('express');
var router              = express.Router();
var db                  = require('../database/connection-knex-postgresql');
var Q                   = require('q');
var dbName              = require('../database/databaseName');;
var validateSchema      = require('../database/utils/validateSchema');
var getSchemaWhiteList  = require('../database/utils/getSchemaWhiteList');
var hashids             = new (require('hashids'))(require('../projectUtils/hashids/salt'));
var getJsonFromString   = require('../projectUtils/getJsonFromString/getJsonFromString');
var table                = require('../database/utils/tableHelper');
var describe            = require('../database/utils/describe');
var authenticate        = require('../projectUtils/authentication/authenticate');

router.get('/:schemaName/:tableName/referencedBy', function(req, res, next){
    table.referencedBy(req.params.schemaName, req.params.tableName)
    .then(function (result) {
        res.json(result);
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});

router.get('/:schemaName/:tableName/foreignKeys', function(req, res, next){
    table.getForeignKeys(req.params.schemaName, req.params.tableName)
    .then(function(result){
        res.json(result);
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});

router.get('/:schemaName/:tableName/describe', function(req, res, next){
    describe(req.params.schemaName, req.params.tableName)
    .then(function(rows){

        res.json(rows);
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});

router.use('/task-tracker', function(req, res, next){ req.schemaName = "task-tracker"; next(); }, require('./task-tracker'));

router.use('/unite', function(req, res, next){ req.schemaName = 'unite'; next(); }, require('./unite'));

router.get('/', function getSchemas(req, res, next) {
    var schemas = [];
	db.select()
    .from("information_schema.schemata")
    .then(function(rows){
        rows.forEach(function(row){
            getSchemaWhiteList().forEach(function(whiteSchema){
                if (row.catalog_name.toLowerCase() !== dbName.toLowerCase()){ return; }
                if (row.schema_name.toLowerCase() !== whiteSchema.toLowerCase()){ return; }
                schemas.push(row.schema_name);
                return;
            });
        });
        res.json(schemas);
    }).catch(function(err){
        res.status(500).json(err);
    }).done();
});

router.get('/:schemaName', function getTables(req, res, next){
    validateSchema(req.params.schemaName)
    .then(function(schemaName){
        return db.select()
        .from('information_schema.tables')
        .where({ table_schema: schemaName });
    })
    .then(function(rows){
        res.json(rows.map(function(row){ return row.table_name; }));
    }).catch(function(error){
        res.status(500).json(error);
    }).done();
});

router.get('/:schemaName/:tableName', function getRecords(req, res, next){
    validateSchema(req.params.schemaName)
    .then(function(schemaName){
        return db.select()
        .withSchema(schemaName)
        .from(req.params.tableName)
        .modify(function(queryBuilder) {

            if (req.query.filter){
                getJsonFromString(req.query.filter)
                .then(function(jsonFilter){
                    if (jsonFilter.id){ jsonFilter.id = parseInt(hashids.decode(jsonFilter.id)); }
                    queryBuilder.andWhere(jsonFilter);
                });
            }
            if (req.query.whereOp){
                getJsonFromString(req.query.whereOp)
                .then(function(whereOp){
                    if (Array.isArray(whereOp)){
                        for (var i = 0; i < whereOp.length; i++){
                            queryBuilder.andWhere(whereOp[i].column, whereOp[i].operator, whereOp[i].value);
                        }
                    } else { queryBuilder.andWhere(whereOp.column, whereOp.operator, whereOp.value); }
                });
            }
            if (req.query.orderBy){
                getJsonFromString(req.query.orderBy)
                .then(function (orderBy){
                    queryBuilder.orderBy(orderBy[0], orderBy[1]);
                });
            }
        });
    }).then(function(rows){
        for (var i = 0; i < rows.length; i++){ rows[i].id = hashids.encode(rows[i].id); }
        res.json(rows);
    }).catch(function (err){
        res.status(500).json(err);
    }).done();
});

router.get('/:schemaName/:tableName/:filter', function getFilteredRecords(req, res, next) {
    Q.all([validateSchema(req.params.schemaName), getJsonFromString(req.params.filter)])
    .spread(function(schemaName, jsonFilter){
        if (jsonFilter.id){ jsonFilter.id = parseInt(hashids.decode(jsonFilter.id)); }
        return db.select()
        .withSchema(schemaName)
        .from(req.params.tableName)
        .where(jsonFilter)
        .andWhere({user_id: req.user.id});        
    }).then(function (rows) {
        for (var i = 0; i < rows.length; i++){ rows[i].id = hashids.encode(rows[i].id); }
        res.json(rows);
    }).catch(function (err) {
        res.status(500).json(err);
    }).done();
});

router.post('/:schemaName/:tableName', function addRecords(req, res, next){
    validateSchema(req.params.schemaName)
    .then(function(schemaName){
        return db.insert(req.body)
        .withSchema(schemaName)
        .into(req.params.tableName);
    }).then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        res.status(500).send(err);
    }).done();    
});

/*
router.delete('/:schemaName/:tableName/:filter', function deleteRecords(req, res, next){
    Q.all([validateSchema(req.params.schemaName), getJsonFromString(req.params.filter)])
    .spread(function(schemaName, jsonFilter){
        return db.del()
        .withSchema(schemaName)
        .from(req.params.tableName)
        .where(jsonFilter);
    }).then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        res.status(500).send(err);
        console.error(err);
    }).done(); 
});
*/

/*
router.delete('/:schemaName/:tableName/:id', authenticate, function deleteRecord(req, res, next){
    var encodedId = req.params.id || req.body.id;
    var id = parseInt(hashids.decode(encodedId));
    validateSchema(req.params.schemaName)
    .then(function(schemaName){
        return db.select()
        .withSchema(schemaName)
        .from(req.params.tableName)
        .where({id: id, user_id: req.user.id});
    }).then(function(recordsToDelete){
        if (recordsToDelete.length > 1){ res.status(500).json({error: "multiple records with this id."}); return; }
        return db.del()
        .withSchema(req.schemaName)
        .from(req.params.tableName)
        .where({id: id, user_id: req.user.id})
        .returning('*');
    }).then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});
*/

/*
router.put('/:schemaName/:tableName/:filter', function updateRecords(req, res, next){
    Q.all([validateSchema(req.params.schemaName), getJsonFromString(req.params.filter)])
    .spread(function(schemaName, jsonFilter){
        return db.update(req.body)
        .withSchema(schemaName)
        .from(req.params.tableName)            
        .where(jsonFilter);
    }).then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        res.status(500).send(err);
        console.error(err);
    }).done(); 
});
*/

router.put('/:schemaName/:tableName/:id', authenticate, function updateRecords(req, res, next){
    var id = parseInt(hashids.decode(req.params.id));
    var item = req.body;
    item.id = id;
    validateSchema(req.params.schemaName)
    .then(function(schemaName){
        return db.update(item)
        .withSchema(schemaName)
        .from(req.params.tableName)
        .where({id: id})
        .returning('*');
    }).then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});

module.exports = router;

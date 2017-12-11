var router = require('express').Router();
var dataManager = require('../../../database/utils/dataManager');
var db = require("../../../database/connection-knex-postgresql");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var tableHelper = require('../../../database/utils/tableHelper');
var respond = require('../../../projectUtils/respond/respond');

router.get('/', function getRecords(req, res, next){
    respond(res, dataManager.autoJoin(req.schemaName, req.tableName, req.query.filter, req.query.whereOp, req.query.orderBy, req.params.isNested, req.user));
});

router.get('/ancestors/:id', function(req, res, next){
    respond(res, getAncestors(req, res, next));
});

router.get('/:filter', function getFilteredRecords(req, res, next) {
    respond(res, dataManager.autoJoin(req.schemaName, req.tableName, req.params.filter, req.query.whereOp, req.query.orderBy, req.params.isNested, req.user));
});

router.post('/', function addRecords(req, res, next){
    //TODO: test this with postman
    respond(res, dataManager.autoSplitInsert(req.schemaName, req.tableName, req.body, req.user, null));
});

router.delete('/:id', function deleteRecord(req, res, next){
    respond(res, dataManager.autoSplitDelete(req.schemaName, req.tableName, req.params.id || req.body.id, null, req.user));
});

router.put('/:id', function updateRecords(req, res, next){
    //TODO: test this with postman
    respond(res, dataManager.autoSplitUpdate(req.schemaName, req.tableName, req.body, req.user, null));
});

function getAncestors(req, res, next){
    return async(function(){
        var ancestors = [];        
        var parentId = req.params.id;
        while(true){
            parentId = tableHelper.decodeSingleIdValue(parentId);            
            var ancestor = await(db.select('*')
            .withSchema(req.schemaName)
            .from(req.tableName)
            .where({id: parentId}))[0];            
            ancestor = await(tableHelper.encodeKeyValues(req.schemaName, req.tableName, ancestor));
            ancestors.push(ancestor);
            parentId = ancestor.parent_id;
            if (parentId === null){ break; }
        }    
        ancestors = ancestors.reverse();
        return ancestors;
    })();    
}

module.exports = router;  
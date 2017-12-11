var db = require("../connection-knex-postgresql");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var tableHelper = require('./tableHelper');
var hashids = new (require('hashids'))(require('../../projectUtils/hashids/salt'));
var getJsonFromString = require('../../projectUtils/getJsonFromString/getJsonFromString');

function autoJoin(schemaName, tableName, filter, whereOp, orderBy, isNested, user){
    return autoJoinRec(schemaName, tableName, filter, whereOp, orderBy, isNested, user, [])
}

function autoJoinRec(schemaName, tableName, filter, whereOp, orderBy, isNested, user, prevJoinedTables){
    if (isNested !== false){ isNested = true; }
    return async(function(){
        var rows = await(db.select()
        .withSchema(schemaName)
        .from(tableName)
        .modify(function (queryBuilder) {
            var usersPrimaryKey = await(tableHelper.getPrimaryKeyColumn(schemaName, "users"));
            if (await(tableHelper.getTableColumns(schemaName, tableName))
            .some(function(x){
                return x.column_name == "user_id";
            })) {
                queryBuilder.andWhere({user_id: user.id});
            }
            if (filter) {
                if (typeof filter === 'string') {
                    filter = await(getJsonFromString(filter));
                }
                filter = await(tableHelper.decodeKeyValues(schemaName, tableName, filter));
                queryBuilder.andWhere(filter);
            }
            if (whereOp) {
                if (typeof whereOp === 'string') {
                    var whereOp = await(getJsonFromString(whereOp));
                }
                if (Array.isArray(whereOp)) {
                    for (var i = 0; i < whereOp.length; i++) {
                        whereOp[i] = await(tableHelper.decodeKeyValues(schemaName, tableName, whereOp[i]));
                        queryBuilder.andWhere(whereOp[i].column, whereOp[i].operator, whereOp[i].value);
                    }
                } else {
                    whereOp = await(tableHelper.decodeKeyValues(schemaName, tableName, whereOp));
                    queryBuilder.andWhere(whereOp.column, whereOp.operator, whereOp.value);
                }
            }
            if (orderBy) {
                //must be a string version of array
                if (typeof orderBy === 'string') {
                    orderBy = await(getJsonFromString(orderBy));
                }
                queryBuilder.orderBy(orderBy[0], orderBy[1]);
            }
        }));
             
        var childFilter = {};
        var rel;
        var row;
        var getReferencedByTables = await(tableHelper.getReferencedByTables(schemaName, tableName));
        var rowPrimaryKeyColumn = await(tableHelper.getPrimaryKeyColumn(schemaName, tableName));
        for (var i = 0; i < rows.length; i++) {
            row = rows[i];
            row = await(tableHelper.encodeKeyValues(schemaName, tableName, row));
            if (!isNested){ continue; }   
            for (var j = 0; j < getReferencedByTables.length; j++) {
                rel = getReferencedByTables[j];
                childFilter[rel.foreign_column] = row[rowPrimaryKeyColumn];
                if (prevJoinedTables.includes(tableName)){ continue; }
                prevJoinedTables.push(tableName);
                row[rel.foreign_table] = await(autoJoinRec(schemaName, rel.foreign_table, childFilter, null, null, isNested, user, prevJoinedTables));
            }
        }
        return rows;
    })();
}

function autoSplitInsert(schemaName, tableName, insertData, user, parentData){
    return async(function(){
        if (Array.isArray(insertData)) {
            throw new Error("Unable to process input data in array format. Must be a single object.");
        }

        var relationships = await(tableHelper.getReferencedByTables(schemaName, tableName));
        var childInsertData = [];
        var foreignTables = [];
        var foreignColumns = [];
        var primaryColumns = [];

        for (var i = 0; i < relationships.length; i++) {
            var rel = relationships[i];
            if (!insertData.hasOwnProperty(rel.foreign_table)) {
                continue;
            }
            childInsertData.push(insertData[rel.foreign_table]);
            foreignTables.push(rel.foreign_table);
            foreignColumns.push(rel.foreign_column);
            primaryColumns.push(rel.primary_column);
            delete insertData[rel.foreign_table];
        }

        insertData = prepareData(schemaName, tableName, insertData, user);

        var insertedRow = await(db.insert(insertData)
        .withSchema(schemaName)
        .into(tableName)
        .returning("*"))[0];

        for (i = 0; i < childInsertData.length; i++) {
            childInsertData[i][foreignColumns[i]] = insertedRow[primaryColumns[i]];
            await(autoSplitInsert(schemaName, foreignTables[i], childInsertData[i], user, insertData));
        }
        insertedRow = await(tableHelper.encodeKeyValues(schemaName, tableName, insertedRow));
        var insertDataIdColumn = await(tableHelper.getPrimaryKeyColumn(schemaName, tableName));
        var insertDataId = insertedRow[insertDataIdColumn];
        var whereOp = {column: insertDataIdColumn, operator: "=", value: insertDataId};
        if (parentData === null) {
            return await(autoJoin(schemaName, tableName, null, whereOp, insertDataIdColumn, true, user));
        }
    })();
}

function autoSplitDelete(schemaName, tableName, encodedId, parentData, user){
    return async(function(){
       if (Array.isArray(encodedId)) {
            throw new Error("Unable to process input data in array format. Must be a single object.");
        }

        var delRecordIdColumn = await(tableHelper.getPrimaryKeyColumn(schemaName, tableName));
        var filter = {};
        filter[delRecordIdColumn] = encodedId;
        var recordToDelete = await(autoJoin(schemaName, tableName, filter, null, null, true, user));
        if (recordToDelete.length > 1) {
            throw new Error("Unable to process input data in array format. Must be a single object.");
        }
        recordToDelete = recordToDelete[0];

        var relationships = await(tableHelper.getReferencedByTables(schemaName, tableName));
        var childData = [];
        var foreignTables = [];
        var foreignColumns = [];
        var primaryColumns = [];
        var relationshipIdColumn;
        var relationshipId;

        for (var i = 0; i < relationships.length; i++) {
            var rel = relationships[i];
            if (!recordToDelete.hasOwnProperty(rel.foreign_table)) {
                continue;
            }
            childData.push(recordToDelete[rel.foreign_table]);
            foreignTables.push(rel.foreign_table);
            foreignColumns.push(rel.foreign_column);
            primaryColumns.push(rel.primary_column);
            relationshipIdColumn = await(tableHelper.getPrimaryKeyColumn(schemaName, rel.foreign_table));
            var childRecordsToDelete = recordToDelete[rel.foreign_table];
            for (var j = 0; j < childRecordsToDelete.length; ++j){
                relationshipId = childRecordsToDelete[j][relationshipIdColumn];
                await(autoSplitDelete(schemaName, rel.foreign_table, relationshipId, recordToDelete, user));
            }
            //delete recordToDelete[rel.foreign_table];

        }

        var id = tableHelper.decodeSingleIdValue(encodedId);
        var deletedRecord = await(
        db(tableName)
        .withSchema(schemaName)
        .where(delRecordIdColumn, "=", id)
        .del()
        .returning("*"))[0];

        // var delRecordId = deletedRecord[delRecordIdColumn];
        // var whereOp = {column: delRecordIdColumn, operator: "=", value: delRecordId};
        if (parentData === null) {
            return recordToDelete;
        }
    })();
}

function autoSplitUpdate(schemaName, tableName, updateData, user, parentData){
    return async(function(){
        if (Array.isArray(updateData)) {
            throw new Error("Unable to process input data in array format. Must be a single object.");
        }

        var relationships = await(tableHelper.getReferencedByTables(schemaName, tableName));
        var childUpdateData = [];
        var foreignTables = [];
        var foreignColumns = [];
        var primaryColumns = [];

        for (var i = 0; i < relationships.length; i++) {
            var rel = relationships[i];
            if (!updateData.hasOwnProperty(rel.foreign_table)) {
                continue;
            }
            childUpdateData.push(updateData[rel.foreign_table]);
            foreignTables.push(rel.foreign_table);
            foreignColumns.push(rel.foreign_column);
            primaryColumns.push(rel.primary_column);
            delete updateData[rel.foreign_table];
        }

        updateData = prepareData(schemaName, tableName, updateData, user);

        var updatedRow = await(db.update(updateData)
        .withSchema(schemaName)
        .into(tableName)
        .returning("*"))[0];

        for (i = 0; i < childUpdateData.length; i++) {
            childUpdateData[i][foreignColumns[i]] = insertedRow[primaryColumns[i]];
            await(autoSplitInsert(schemaName, foreignTables[i], childUpdateData[i], user, updateData));
        }
        updatedRow = await(tableHelper.encodeKeyValues(schemaName, tableName, updatedRow));
        var updatedDataIdColumn = await(tableHelper.getPrimaryKeyColumn(schemaName, tableName));
        var updatedDataId = updatedRow[insertDataIdColumn];
        var whereOp = {column: updatedDataIdColumn, operator: "=", value: updatedDataId};
        if (parentData === null) {
            return await(autoJoin(schemaName, tableName, null, whereOp, updatedDataIdColumn, true, user));
        }
    })();
}

function prepareData(schemaName, tableName, insertData, user){
    var foreignKeys = await(tableHelper.getForeignKeyTables(schemaName, tableName));
    var primaryColumnName = await(tableHelper.getPrimaryKeyColumn(schemaName, tableName));
    delete insertData[primaryColumnName];
    insertData = await(tableHelper.decodeKeyValues(schemaName, tableName, insertData));
    for (var i = 0; i < foreignKeys.length; i++){
        var fKey = foreignKeys[i];
        if (fKey.foreign_table !== 'users' || fKey.foreign_column !== 'id'){ continue; }
        insertData[fKey.primary_column] = user.id;
    }
    return insertData;
}

module.exports = {
    autoJoin: autoJoin,
    autoSplitInsert: autoSplitInsert,
    autoSplitDelete: autoSplitDelete,
    autoSplitUpdate: autoSplitUpdate
};
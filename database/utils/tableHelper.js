var db = require("../connection-knex-postgresql");
var async = require("asyncawait/async");
var await = require("asyncawait/await");
var hashids = new (require('hashids'))(require('../../projectUtils/hashids/salt'));

function foreignKeys_old(schemaName, tableName){
    return db.raw("SELECT conname, " +
        "pg_catalog.pg_get_constraintdef(r.oid, true) as condef " +
        "FROM pg_catalog.pg_constraint r " +
        "WHERE r.conrelid = '??.??'::regclass AND r.contype = 'f'", [schemaName, tableName]);
}

function getForeignKeyTables(schemaName, tableName){
    return db.select(
    "ccu.table_name AS foreign_table",
    "ccu.column_name AS foreign_column",
    "tc.table_name AS primary_table",
    "kcu.column_name AS primary_column")
    .withSchema("information_schema")
    .from("table_constraints AS tc")
    .innerJoin("key_column_usage AS kcu", "tc.constraint_name", "kcu.constraint_name")
    .innerJoin("constraint_column_usage AS ccu", "tc.constraint_name", "ccu.constraint_name")
    .where("constraint_type", "=", 'FOREIGN KEY')
    .andWhere("tc.table_schema", "=", schemaName)
    .andWhere("tc.table_name", "=", tableName);
}

function hasForeignKeyColumn(primaryTable, foreignTable, foreignColumn, schemaName){
    return getForeignKeyTables(schemaName, primaryTable)
    .modify(function(queryBuilder){
            queryBuilder
                .andWhere("ccu.table_name", "=", foreignTable)
                .andWhere("ccu.column_name", "=", foreignColumn);
    }).then(function(results){
        return results.length > 0;
    });
}

function getKeyColumns(schemaName, tableName){
    return db.select("column_name")
    .withSchema("information_schema")
    .from("table_constraints AS tc")
    .innerJoin("key_column_usage AS kcu", "tc.constraint_name", "kcu.constraint_name")
    .andWhere("tc.table_schema", "=", schemaName)
    .andWhere("tc.table_name", "=", tableName)
    .andWhere(function(){
        this.where("constraint_type", "=", 'PRIMARY KEY')
        .orWhere("constraint_type", "=", 'FOREIGN KEY');
    });
}

function decodeKeyValues(schemaName, tableName, entity){
    return async(function(){
        var keyColumns = await(getKeyColumns(schemaName, tableName));
        for(var i = 0; i < keyColumns.length; i++){
            if (!entity.hasOwnProperty(keyColumns[i].column_name)){ continue; }
            if (typeof entity[keyColumns[i].column_name] === 'number'){ throw new Error("key value must be an encoded string"); }
            if (entity[keyColumns[i].column_name] === null){ continue; }
            entity[keyColumns[i].column_name] = hashids.decode(entity[keyColumns[i].column_name])[0];
        }
        return entity;
    })();
}

function decodeSingleIdValue(encodedId){
    return parseInt(hashids.decode(encodedId));
}

function encodeKeyValues(schemaName, tableName, entity){
    return async(function(){
        var keyColumns = await(getKeyColumns(schemaName, tableName));
        for(var i = 0; i < keyColumns.length; i++){
            if (!entity.hasOwnProperty(keyColumns[i].column_name)){ continue; }
            if (typeof entity[keyColumns[i].column_name] === 'string'){ throw new Error("key value must be a number"); }
            if (entity[keyColumns[i].column_name] === null){ continue; }
            entity[keyColumns[i].column_name] = hashids.encode(entity[keyColumns[i].column_name]);
        }
        return entity;
    })();
}

function getReferencedByTables(schemaName, tableName){
    return db.select(
        "tc.table_name AS foreign_table",
        "kcu.column_name AS foreign_column",
        "ccu.table_name AS primary_table",
        "ccu.column_name AS primary_column"
    )
    .withSchema("information_schema")
    .from("table_constraints AS tc")
    .innerJoin("key_column_usage AS kcu", "tc.constraint_name", "kcu.constraint_name")
    .innerJoin("constraint_column_usage AS ccu", "tc.constraint_name", "ccu.constraint_name")
    .where("constraint_type", "=", 'FOREIGN KEY')
    .andWhere("tc.table_schema", "=", schemaName)
    .andWhere("ccu.table_name", "=", tableName);
}

function getPrimaryKeyColumn(schemaName, tableName){
    return db.select("column_name")
    .withSchema("information_schema")
    .from("table_constraints AS tc")
    .innerJoin("key_column_usage AS kcu", "tc.constraint_name", "kcu.constraint_name")
    .andWhere("tc.table_schema", "=", schemaName)
    .andWhere("tc.table_name", "=", tableName)
    .andWhere("constraint_type", "=", 'PRIMARY KEY')
    .then(function(results){
        if (results.length > 1){ throw new Error("more than one primary key found"); }
        return results[0].column_name
    });
}

function getTableColumns(schemaName, table_name, column_name){
    return db.select(
        'column_name', 
        'data_type',
        'table_name'
    ).withSchema('information_schema')
    .from('columns')
    .where({table_schema: schemaName})
    .andWhere({table_name: table_name});
}

module.exports = {
    getForeignKeyTables: getForeignKeyTables,
    hasForeignKeyColumn: hasForeignKeyColumn,
    decodeKeyValues: decodeKeyValues,
    decodeSingleIdValue: decodeSingleIdValue,
    encodeKeyValues: encodeKeyValues,
    getReferencedByTables: getReferencedByTables,
    getKeyColumns: getKeyColumns,
    getPrimaryKeyColumn: getPrimaryKeyColumn,
    getTableColumns: getTableColumns
};
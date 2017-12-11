var express = require('express');
var router = express.Router();
var pool = require('../database/connection-mysql');
var mysql = require('mysql');
var builder = require('mongo-sql');
var Q = require('q');


//todo: when adding a new section, add all of the class days to the database
router.get('/', function(req, res, next) {
	pool.query("SHOW DATABASES;")
    .then(function(dbTables){
        var results = {tables: []};
        getDBWhiteList().forEach(function(whiteDB){
            dbTables.forEach(function(dbTable){
                if (whiteDB.toLowerCase() !== dbTable.Database.toLowerCase()){ return; }
                results.tables.push(whiteDB);
            })
        });
        res.json(results);
    }).catch(function(err){
        res.status(500).json(err);
    }).done();
    //api.rjfreund.com/homework-tracker/
});

router.get('/:dbName', function(req, res, next){
    pool.setDB(getDB(req.params.dbName))
    .then(function(dbName){
        return pool.query("SHOW TABLES;")
    })
    .then(function(rows){
        res.json(rows);
    }).catch(function(error){
        console.error(error);
        res.status(404).json(error);
    }).done();
});

router.get('/:dbName/:tableName', function(req, res, next){
    //todo: finish writing queries that find out what types of tables, like classes and users, are associated with homework-tracker
    var dbName = req.params.dbName;
    var tableName = req.params.tableName;
    pool.setDB(getDB(dbName))
    .then(function(dbName) {
        return pool.query("SELECT * FROM ?? ", [tableName]);
    }).then(function(rows){
        res.json(rows);
    }).catch(function (err){
        res.status(500).json(err);
    }).done();

        /*
            .then(function(homeworkTrackerIds){
                if (homeworkTrackerIds.length > 1){ return Q.defer().reject(new Error("multiple ids exist for this app")).promise; }
                var homeworkTrackerId = homeworkTrackerIds[0].id;
                return db.query("" +
                    "SELECT " +
                    "TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME " +
                    "FROM " +
                    "INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                    "WHERE " +
                    "REFERENCED_TABLE_SCHEMA = " + db.escape(db.config.connectionConfig.database) + " AND " +
                    "REFERENCED_TABLE_NAME = " + db.escape(dbName) + ";"
                ).then(function(referredTables){
                    var promises = [];
                    var sql = "";
                    referredTables.forEach(function(referredTable){
                        sql = "" +
                            "SELECT * FROM " + db.escapeId(referredTable.TABLE_NAME) +
                            " WHERE " + db.escapeId(referredTable.COLUMN_NAME) + " = " + db.escape(homeworkTrackerId);
                        sql = mysql.format(sql);
                        promises.push(db.query(sql));
                    });
                    return Q.all(promises);
                });
            });
    }).then(function(rows){
        //
        res.json(rows);
    }).catch(function(error){
        console.error(error);
        res.status(404).json({error: "route not found"});
    }).done(); */
    /*
    isTableFound(req.params.tableName, function(){ res.status(404).json({error: "table not found"}); return;} );
    isAppFound(req.params.appName, req.params.tableName, function(){ res.status(404).json({error: "app not found"}); return; });
    connection.query("SELECT * FROM ??", [req.params.tableName], function(err, rows, fields){ res.json(rows); });
    */
});

router.get('/:dbName/:tableName/:filter', function(req, res, next) {
    var dbName = req.params.dbName;
    var tableName = req.params.tableName;
    var filter = req.params.filter;
    pool.setDB(getDB(dbName))
        .then(function (dbName) {
            var sql = getSql(filter);
            return pool.query(sql);
        }).then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        res.status(500).json(err);
    }).done();
});

function getSql(filter){
    var jsonFilter = {};
    try{
        filter = filter.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
        jsonFilter = JSON.parse(filter);
    }
    catch(err){
        res.status(500).json({error: "filter not in mongodb filter format"});
        return;
    }
    var sql = "";
    
}

function getDB(dbName){
    var deferred = Q.defer();
    var isTableFound = false;
    getDBWhiteList().forEach(function(whiteTable){
        if (whiteTable.toLowerCase() !== dbName.toLowerCase()){ return; }
        isTableFound = true;
        deferred.resolve(dbName);
        return;
    });
    if (!isTableFound){ deferred.reject(new Error('table not found')); }
    return deferred.promise;
}

function getDBWhiteList(){
    var dbWhiteList = [
        'homework-tracker'
    ];
    return dbWhiteList;
}

function getJson(str){
    try {
        str = str.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = router;

var db = require("../connection-knex-postgresql");
var dbConstants = require("./dbConstants");
var async = require('asyncawait/async');
var await = require('asyncawait/await');


var databaseSeeder = {
    seedDatabase: function(schemaName){         
        return async(function(){
            var tableName = 'task_status_options';
            var taskStatusOptions = dbConstants.getTaskStatusOptions();               
            var existingTaskStatuses = await(db.select("*")
                .withSchema(schemaName)
                .from(tableName)
                .whereIn("name", taskStatusOptions.map(function(x){ return x.name; })))
                .map(function(x){ return x.name; });
            var taskOptions = [];
            taskStatusOptions.forEach(function(taskStatusOption){
                if (existingTaskStatuses.includes(taskStatusOption.name)){ return; }
                taskOptions.push(taskStatusOption);
            });            
            return await(db.insert(taskOptions)
                .withSchema(schemaName)
                .into(tableName)                
                .returning("*"));
        })();        
    }
};

module.exports = databaseSeeder;
var getSchemaWhiteList = require('./getSchemaWhiteList');
var Q = require('q');

module.exports =  function validateSchema(schemaName){
    var deferred = Q.defer();
    var isValid = false;
    getSchemaWhiteList().forEach(function(whiteSchema){
        if (whiteSchema.toLowerCase() !== schemaName.toLowerCase()){ return; }
        isValid = true;
        deferred.resolve(schemaName);
        return;
    });
    if (!isValid){ deferred.reject(new Error('Application name not valid.')); }
    return deferred.promise;
};
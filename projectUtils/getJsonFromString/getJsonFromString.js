var Q = require('q');

module.exports = function getJson(str){
    var deferred = Q.defer();
    if (Array.isArray(str)){ deferred.resolve(str); return deferred.promise; }
    if (typeof str === 'number'){
        deferred.resolve(str);
        return deferred.promise;
    }
    var json;
    try {
        str = str.replace(/'/g, "\"");
        str = str.replace(/([{,])\s*(['"])?([a-z0-9A-Z_$]+)(['"])?\s*:/g, '$1 "$3": ');
        json = JSON.parse(str);
        deferred.resolve(json);
    } catch (e) {
        deferred.reject(new Error("Cannot parse json string"));
    }
    return deferred.promise;
};
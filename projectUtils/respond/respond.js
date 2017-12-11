module.exports = function respond(res, promise){
    promise.then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        console.error(err);
        res.status(500).send(err.message);
    }).done();
};
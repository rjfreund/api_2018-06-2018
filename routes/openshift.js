var sysInfo = require('../utils/sys-info');
var express = require('express');
var router = express.Router();

// IMPORTANT: Your application HAS to respond to GET /health with status 200
//            for OpenShift health monitoring
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/health', function(req, res, next){
	res.send(200);
});

router.get('/info', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache, no-store');
	res.send(JSON.stringify(sysInfo[url.slice(6)]()));
});

module.exports = router;

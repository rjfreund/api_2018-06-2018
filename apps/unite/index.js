var router = require('express').Router();  
var path = require('path');
var db = require('../../database/connection-knex-postgresql');
var moment = require('moment');
var hashids = new (require('hashids'))(require('../../projectUtils/hashids/salt'));
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var jwtConfig = require('../../projectUtils/authentication/jsonwebtoken-config');
var getJson = require('../../projectUtils/getJsonFromString/getJsonFromString');
var bcrypt = require('bcryptjs');
var tasksHost = require('../../projectUtils/tasksHost/tasksHost');
var dbSeeder = require('../../database/utils/dbSeeder');
var respond = require('../../projectUtils/respond/respond');
var aq = require('../../database/utils/autoQuery');
var authenticate = require('../../projectUtils/authentication/authenticate');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var schemaName = __dirname.split(path.sep).pop();

router.get('/', function getTables(req, res, next){    	
    db.select()
    .from('information_schema.tables')
    .where({ table_schema: req.schemaName }) 
    .then(function(rows){
        res.json(rows.map(function(row){ return row.table_name; }));
    }).catch(function(error){
        res.status(500).send(error.message);
    }).done();
});

router.get('/:tableName', function getRecords(req, res, next){    
return async(function(){
	try{
		var o = {};
		o.schemaName = schemaName;
		o.tableName = req.params.tableName;
		o.filter = req.query.filter;
		o.whereOp = req.query.whereOp;
		o.orderBy = req.query.orderBy;
		o.shouldAutoJoin = req.query.shouldAutoJoin;
		o.user = req.user;
		var rows = aq.autoJoin(o);
		res.json(rows);
	} catch (ex){
		console.error(ex);
		res.status(500).send(ex.message);
	}
})();	
});

router.get('/:tableName/describe', function getTableDescription(req, res, next) {
    //Also, knex(req.tableName).columnInfo() doesn't return anything for some reason...
    db.select()
    .from("information_schema.columns")
    .where({ table_name: 'categories' })
    .then(function (rows) {
        res.json(rows);
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});

router.post('/signup', function(req, res, next){
    var userSignups = 'user_signups';
    db.select()
    .withSchema(req.schemaName)
    .from("users")
    .where({ email: req.body.email })
    .then(function(existingUsers) {
        if (existingUsers.length > 0) { res.status(500).json({error: "This email address already exists."}); return; }
        return db.select().withSchema(req.schemaName).from(userSignups).where({email: req.body.email});
    }).then(function(existingUserSignups) {
        if (existingUserSignups.length == 0) { return; }
        return db.del()
        .withSchema(req.schemaName)
        .from(userSignups)
        .where({email: req.body.email})
        .returning("*");
    }).then(function(deletedUserSignups){
        var hash = bcrypt.hashSync(req.body.password, 10);
        return db.insert({
            email: req.body.email, 
            password: hash, 
            expiration_date: moment.utc().add({months: 1}).format(),
            creation_date: moment.utc().format()
        }).withSchema(req.schemaName)
        .into(userSignups)
        .returning('*');
    }).then(function(userSignups){
        var userSignup = userSignups[0];
        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: 'setup@rjfreund.com',
                pass: 'setuprjfreund!!'
            },
            tls: {
                rejectUnauthorized: false
            }
        });                
        var fullUrl = tasksHost + '/confirm-signup/' + hashids.encode(userSignup.id);
        var mailOptions = {
            from: '"User Setup" <setup@rjfreund.com>', // sender address
            to: req.body.email, // list of receivers
            subject: 'New User', // Subject line
            html: '<html><body><div>Confirm user signup at <a href="' + fullUrl + '">' + fullUrl + '</a></div></body></html>'
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                res.status(500).json(error);
                return;
            }
            console.log('Message sent: ' + info.response);
            res.json({user_signups_hashed_id : hashids.encode(userSignup.id)});
        });
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});

router.post('/confirm-signup', function(req, res, next){
    var userSignupId = hashids.decode(req.body.signupId)[0];
    var userId = null;
    db.transaction(function(trx){
        return trx.select()
        .from("user_signups")
        .withSchema(req.schemaName)
        .where({id: userSignupId})
        .then(function(users){
            if (users.length > 1){ res.status(500).send("More than one user account found with this info."); return; }
            if (users.length === 0){ res.status(500).send("No users found with email and password."); return; }
            var user = users[0];
            return trx.insert({
                email: user.email, 
                password: user.password,
                first_name: user.first_name,
                last_name: user.last_name,
                creation_date: moment.utc().format()
            }).withSchema(req.schemaName)
            .into("users");
        }).then(function(result){
            return trx.del()
            .from("user_signups")
            .withSchema(req.schemaName)
            .where({id: userSignupId});
        });    
    }).then(function(result){
        var token = jwt.sign({ sub: userId }, jwtConfig.secret, { expiresIn: "1 day" });
        res.json({ token: token });
        return;
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});

router.post('/login', function(req, res, next){
    db.select()
    .withSchema(req.schemaName)
    .from("users")
    .where({ email: req.body.email })
    .then(function(users){
        if (users.length > 1){ res.status(500).send("More than one user account found with this info."); return; }
        if (users.length === 0){ res.status(500).send("No users found with email and password."); return; }
        var user = users[0];
        if (!bcrypt.compareSync(req.body.password, user.password)){ res.status(500).send("Password is incorrect."); return; }
        var token = jwt.sign({ sub: user.id }, jwtConfig.secret, { expiresIn: "1 day" });
        res.json({ token: token });
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});

router.post('/change-password', function(req, res, next){
    if (req.body.newPassword !== req.body.confirmNewPassword){ res.status(500).send("Passwords do not match."); return; }
    db.select()    
    .from("users")
    .withSchema(req.schemaName)
    .where({ email: req.body.email })
    .then(function(users){
        if (users.length > 1){ res.status(500).send("More than one user account found with this info."); return; }
        if (users.length === 0){ res.status(500).send("No users found with email and password."); }
        var user = users[0];
        var hash = bcrypt.hashSync(req.body.newPassword, 10);
        return db.update({password: hash})
        .from("users")
        .withSchema(req.schemaName)
        .where({id: user.id})
        .then(function(rows){
            res.json({message: "New password successfully set."});
        });
    }).catch(function (err) {
        res.status(500).send(err.message);
    }).done();
});

router.post('/verifytoken', function(req, res, next){
	var token = req.header("Authorization").replace("Bearer ", "");
        jwt.verify(token, jwtConfig.secret, function(err, decoded) {
        if (err){ res.status(500).json(err); return; }
        res.json({ isTokenValid: true });
    });    
});

module.exports = router;  

var express = require('express');
var router = express.Router();
//var nconf = require('nconf');
var buddy = require('buddy-sdk');

//nconf.argv().env();
//
//nconf.file({ file: __dirname + '/config.json' });

//if (isProduction) {
//	nconf.file({ file: __dirname + '/production.config.json' });
//}

//console.log(nconf.get('buddyapp:id') + " " + nconf.get('buddyapp:key'));

buddy.init("bbbbbc.PgdbvpGnkFqC", "209284F8-D47C-4046-BB30-413315B7353D", {instanceName: 'bob'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to Buddy' });
});

router.post('/createUser', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var response = res;
    
    console.log('In create user');
    
    buddy.post('/users', {username: username, password: password}, function(err, res) {
        if(err) {
            next(err);
        } else {
            console.log('SUCCESS - User Created');
            response.send({redirect: '/overview'});
            response.statusCode = 302;
        }
    });
    
});

router.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var response = res;
    
    console.log('In user login');
    
    buddy.post('/users/login', {username: username, password: password}, function(err, res) {
        if(err) {
            next(err);
        } else {
            console.log('SUCCESS - Logging in');
            response.send({redirect: '/overview'});
            response.statusCode = 302;
        }
    });
});

router.get('/overview', function(req, res, next) {
    res.render('overview', {title: 'App Overview'});
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to Buddy' });
});

router.post('/createUser', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var response = res;
    
    console.log('In create user');
    
    Buddy.post('/users', {username: username, password: password}, function(err, res) {
        if(err) {
            next(err);
        } else {
            console.log('SUCCESS - User Created');
            response.send({redirect: '/overview', userId: res.result.id});
            response.statusCode = 302;
        }
    });
    
});

router.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var response = res;
    
    Buddy.post('/users/login', {username: username, password: password}, function(err, res) {
        if(err) {
            next(err);
        } else {
            console.log('SUCCESS - Logging in');
            response.send({redirect: '/overview', userId: res.result.id});
            response.statusCode = 302;
        }
    });
});

module.exports = router;

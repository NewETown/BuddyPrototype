var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('overview', {title: 'App Overview'});
});

module.exports = router;

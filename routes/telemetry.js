var express = require('express');
var router = express.Router();
var https = require('https');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var API_KEY = "B02A2540-136D-401B-A053-49CBE02189C7";
var DEVICE_ID = "blj.MLfbvLvdtKqC"; // temporary

router.post('/add', jsonParser, function(req, res, next) {
    var body = req.body;
    var data = JSON.parse(body.telemetry);
    var timestamp = body.timestamp;
    var response = res;
    
    console.log(data);
    console.log(timestamp);
    
    Buddy.post('/telemetry/proto', {data: data, timestamp: timestamp}, function(err, res) {
        if(err) {
            console.log(err);
            next(err);
        } else {
            response.statusCode = res.statusCode;
            console.log('Posted telemetry data');
        }
    });
});

router.get('/get', function(req, res) {
    var root = "https://api.buddyplatform.com";
    var url = root + '/integrations/telemetry/search?apiKey=' + encodeURIComponent(API_KEY) + "&limit=30&";
    
    url += 'deviceid=' + DEVICE_ID;
    
    // Need to add user ID to telemetry?
    // url += 'userid=' + encodeURIComponent(req.params.userId);
    // Can't do anything with a unique ID yet?
    // url += 'uniqueid=' + req.params.id;
    
    
    https.get(url, function(res2) {
	  var body = "";
	  res2.on('data', function(chunk) {
        body += chunk;
	  });

	  res2.on('end', function() {
	  	   var r = JSON.parse(body);
	  	   res.status(res2.statusCode).json(r);  
	  });

	}).on('error', function(e) {
	  console.error(e);
	});
});

module.exports = router;

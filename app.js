var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');
var nconf = require('nconf');
var buddy = require('buddy-sdk');

var index = require('./routes/index');
var telemetry = require('./routes/telemetry');
var overview = require('./routes/overview');

var app = express();

//var isProduction = ('production' == app.get('env') || process.env.NODE_ENV == 'production') === true;

nconf.argv().env();

nconf.file({ file: __dirname + '/config.json' });

//if (isProduction) {
//	nconf.file({ file: __dirname + '/production.config.json' });
//}

//var model = null;
//var match = /\((.*?);/.exec(navigator.userAgent);
//
//if(match) {
//    model = match[1];
//}
//
//var options = {
//    platform: "Prototype",
//    model: model,
////    unique_id: req.body.unique_id
//};

Buddy = buddy.init(nconf.get('buddyapp:id'), nconf.get('buddyapp:key'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/', index);
app.use('/overview', overview);
app.use('/telemetry', telemetry);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

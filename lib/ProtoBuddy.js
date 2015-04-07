var _ = require('underscore');
var nconf = require('nconf');
var buddy = require('buddy-sdk');
buddy.Buddy.init(nconf.get('buddyapp:id'), nconf.get('buddyapp:key'));
exports.Buddy = buddy.Buddy.instance;
var Joi = require('../../joi');

var joiRules = [

	{ resource: '/foo/001', cache: true, expiresat: '02:00' },
	{ resource: '/foo/002', cache: false },
	{ resource: '/foo/003', cache: true, expires: 10 },
	{ resource: '/foo/004', cache: true, expires: 5 },
	{ resource: '/foo/005', cache: true, expires: 2 }
];

//var joiClient = Joi.create({
//
//	port: 27017,
//	address: '127.0.0.1',
//	connectionType: Joi.connectionType.MONGO,
//	expiryRules: joiRules
//});
//
var joiClient = Joi.create({

	port: 6379,
	address: '127.0.0.1',
	connectionType: Joi.connectionType.REDIS,
	expiryRules: joiRules
});

//var joiClient = Joi.create({
//
//	port: 8008,
//	address: '127.0.0.1',
//	connectionType: Joi.connectionType.REST
//});

// for testing we are creating request like objects, these would normally come from the http connection accept.

var request = [ // These are all arbitrary for testing, in practice these will be the request object from http
	{ url: '/foo/001' },
	{ url: '/foo/002' },
	{ url: '/foo/003' },
	{ url: '/foo/004' },
	{ url: '/foo/005' }
];

joiClient.clearCacheForRequest(request[0], function() {});
joiClient.clearCacheForRequest(request[1], function() {});
joiClient.clearCacheForRequest(request[2], function() {});
joiClient.clearCacheForRequest(request[3], function() {});
joiClient.clearCacheForRequest(request[4], function() {});

console.log('Clearing of sample cache complete.');


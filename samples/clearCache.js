var Joi = require('../../joi');

var mongo = Joi.create({

	port: 27017,
	address: '127.0.0.1',
	connectionType: Joi.connectionType.MONGO
});

var redis = Joi.create({

	port: 6379,
	address: '127.0.0.1',
	connectionType: Joi.connectionType.REDIS
});

// for testing we are creating request like objects, these would normally come from the http connection accept.

var request = [ // These are all arbitrary for testing, in practice these will be the request object from http
	{ url: '/foo/001' },
	{ url: '/foo/002' },
	{ url: '/foo/003' },
	{ url: '/foo/004' },
	{ url: '/foo/005' }
];

mongo.clearCacheForRequest(request[0], function() {});
mongo.clearCacheForRequest(request[1], function() {});
mongo.clearCacheForRequest(request[2], function() {});
mongo.clearCacheForRequest(request[3], function() {});
mongo.clearCacheForRequest(request[4], function() {});

redis.clearCacheForRequest(request[0], function() {});
redis.clearCacheForRequest(request[1], function() {});
redis.clearCacheForRequest(request[2], function() {});
redis.clearCacheForRequest(request[3], function() {});
redis.clearCacheForRequest(request[4], function() {});

console.log('Clearing of sample cache complete.');


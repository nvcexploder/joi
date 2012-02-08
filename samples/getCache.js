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

// Dump the values out to the console

function createUniqueLog(logPrefix) {

	return function(outString) {
	
		console.log('');
		console.log('LOG[' + logPrefix + ']: ' + outString);
		console.log('');
	}
}

mongo.getCacheForRequest(request[0], createUniqueLog('Mongo1'));
mongo.getCacheForRequest(request[1], createUniqueLog('Mongo2'));
mongo.getCacheForRequest(request[2], createUniqueLog('Mongo3'));
mongo.getCacheForRequest(request[3], createUniqueLog('Mongo4'));
mongo.getCacheForRequest(request[4], createUniqueLog('Mongo5'));

redis.getCacheForRequest(request[0], createUniqueLog('Redis1'));
redis.getCacheForRequest(request[1], createUniqueLog('Redis2'));
redis.getCacheForRequest(request[2], createUniqueLog('Redis3'));
redis.getCacheForRequest(request[3], createUniqueLog('Redis4'));
redis.getCacheForRequest(request[4], createUniqueLog('Redis5'));


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

var fakeJson = [ // These are just value strings for testing
	'{ \'nameM\': \'Joe Schmoe\', \'age\': 30 }',
	'{ \'nameM\': \'Jane Plain\', \'age\': 31 }',
	'{ \'nameM\': \'Jack Whack\', \'age\': 32 }',
	'{ \'nameM\': \'Jill Pille\', \'age\': 33 }',
	'{ \'nameM\': \'John Trawn\', \'age\': 34 }',
	'{ \'nameR\': \'Moe Schmoe\', \'age\': 40 }',
	'{ \'nameR\': \'Mane Plain\', \'age\': 41 }',
	'{ \'nameR\': \'Mack Whack\', \'age\': 42 }',
	'{ \'nameR\': \'Mill Pille\', \'age\': 43 }',
	'{ \'nameR\': \'Mohn Trawn\', \'age\': 44 }'
];

// First mongo, 5 urls cached

mongo.setCacheForRequest(request[0], fakeJson[0], function() {});
mongo.setCacheForRequest(request[1], fakeJson[1], function() {});
mongo.setCacheForRequest(request[2], fakeJson[2], function() {});
mongo.setCacheForRequest(request[3], fakeJson[3], function() {});
mongo.setCacheForRequest(request[4], fakeJson[4], function() {});

// Next redis, 5 urls cached

redis.setCacheForRequest(request[0], fakeJson[5], function() {});
redis.setCacheForRequest(request[1], fakeJson[6], function() {});
redis.setCacheForRequest(request[2], fakeJson[7], function() {});
redis.setCacheForRequest(request[3], fakeJson[8], function() {});
redis.setCacheForRequest(request[4], fakeJson[9], function() {});


console.log('Setting of sample cache complete.');
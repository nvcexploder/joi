var Joi = require('../../joi');

var joiRules = [

//	{ resource: 'default', cache: false },
	{ resource: '/foo/001', cache: true, expiresat: '02:00' },
	{ resource: '/foo/002', cache: false },
	{ resource: '/foo/003', cache: true, expires: 10 },
	{ resource: '/foo/004', cache: true, expires: 5 },
	{ resource: '/foo/005', cache: true, expires: 2 }
];

var joiClient = Joi.create({

	port: 27017,
	address: '127.0.0.1',
	connectionType: Joi.connectionType.MONGO,
	expiryRules: joiRules
});
//var joiClient = Joi.create({
//
//	port: 6379,
//	address: '127.0.0.1',
//	connectionType: Joi.connectionType.REDIS
//});
//
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

// Dump the values out to the console

function createUniqueLog(logPrefix) {

	return function(outString) {
	
		console.log('');
		console.log('LOG[' + logPrefix + ']: ' + outString);
		console.log('');
	}
}

joiClient.getCacheForRequest(request[0], createUniqueLog('joiClient1'));
joiClient.getCacheForRequest(request[1], createUniqueLog('joiClient2'));
joiClient.getCacheForRequest(request[2], createUniqueLog('joiClient3'));
joiClient.getCacheForRequest(request[3], createUniqueLog('joiClient4'));
joiClient.getCacheForRequest(request[4], createUniqueLog('joiClient5'));


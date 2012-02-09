var Joi = require('../../joi');

//var joiClient = Joi.create({
//
//	port: 27017,
//	address: '127.0.0.1',
//	connectionType: Joi.connectionType.MONGO
//});
//
//var joiClient = Joi.create({
//
//	port: 6379,
//	address: '127.0.0.1',
//	connectionType: Joi.connectionType.REDIS
//});
//
var joiClient = Joi.create({

	port: 8008,
	address: '127.0.0.1',
	connectionType: Joi.connectionType.REST
});

// for testing we are creating request like objects, these would normally come from the http connection accept.

var request = [ // These are all arbitrary for testing, in practice these will be the request object from http
	{ url: '/foo/001' },
	{ url: '/foo/002' },
	{ url: '/foo/003' },
	{ url: '/foo/004' },
	{ url: '/foo/005' }
];

var data = [ // These are just value strings for testing
	{  nameM: 'Joe Schmoe', age: 30 },
	{  nameM: 'Jane Plain', age: 31 },
	{  nameM: 'Jack Whack', age: 32 },
	{  nameM: 'Jill Pille', age: 33 },
	{  nameM: 'John Trawn', age: 34 }
];

// First mongo, 5 urls cached

joiClient.setCacheForRequest(request[0], JSON.stringify(data[0]), function() {});
joiClient.setCacheForRequest(request[1], JSON.stringify(data[1]), function() {});
joiClient.setCacheForRequest(request[2], JSON.stringify(data[2]), function() {});
joiClient.setCacheForRequest(request[3], JSON.stringify(data[3]), function() {});
joiClient.setCacheForRequest(request[4], JSON.stringify(data[4]), function() {});

console.log('Setting of sample cache complete.');
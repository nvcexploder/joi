/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/

// JOI REST Services Client utility functions

var https = require('https');
var http = require('http');

var internals = {

	makeAPIrequest: function(server, relativeURL, putData, reqMethod, reply) {
	
		var requestOptions = {
			host: server.getAddress(),
			port: server.getPort(),
			path: relativeURL,
			encoding: 'application/json',
//			headers: req.headers,
//			agent: req.agent,
			method: reqMethod
		};
		
		if (putData) {
			requestOptions.headers = {
				'Content-Type': 'application/json',
				'Content-Length': putData.length
			}
		}

		var HTTP = server.getTransport();
		
		var req = HTTP.request(requestOptions, function(res) {

			var jsonString = '';

			res.on('data', function(d) {
			
				if (d) {
				
					jsonString = jsonString + d;
				}
			});

			res.on('end', function(d) {
			
				if (d) {
				
					jsonString = jsonString + d;
				}
				reply( jsonString );
			});
		});

		if (putData) {
		
			req.write(putData);
		}
		req.end();

		req.on('error', function(e) {

			reply( { 'error': '' + e } );

		});
	},
	
	getAPIrequest: function(server, relativeURL, reply) {
		
		internals.makeAPIrequest(server, relativeURL, null, 'GET', reply);
	},
	
	putAPIrequest: function(server, relativeURL, data, reply) {
		
		internals.makeAPIrequest(server, relativeURL, data, 'PUT', reply);
	},
	
	deleteAPIrequest: function(server, relativeURL, reply) {
		
		internals.makeAPIrequest(server, relativeURL, null, 'DELETE', reply);
	}
};


// Server class creation. the valid options are include: port, address
	
exports.create = function(inOptions) {
	
	var defaultPort = 8165;
	var defaultAddress = '127.0.0.1';
	var defaultTransport = http;
	
	if (inOptions.port) {
	
		defaultPort = inOptions.port;
	}
	
	if (inOptions.address) {
	
		defaultAddress = inOptions.address;
	}
	
	if (inOptions.transport && inOptions.transport=='https') {
	
		defaultTransport = https;
	}
	
	var server = {
	
		initialOptions: inOptions,
		
		port: defaultPort,
		
		address: defaultAddress,
		
		transport: defaultTransport,
		
		public: {

			// The properties are the first methods listed
			
			// the server port 
			
			getPort: function() { 
			
				return server.port; 
			},
			
			// the server address 
			
			getAddress: function() { 
			
				return server.address; 
			},
			
			getTransport: function() {
			
				return server.transport;
			},
			
			// The end of the properties
			
			cacheForKey: function(key, cacheOutput) {
				
				internals.getAPIrequest(server.public, key, cacheOutput);
			},

			setCacheForKey: function(key, entry, next) {
				
				internals.putAPIrequest(server.public, key, entry, function(response) {
				
					next();
				});
			},

			clearCacheForKey: function(key, next) {
				
				internals.deleteAPIrequest(server.public, key, function(response) {
				
					next();
				});
			},
			
			// Close / remove connection
			
			end: function () {
			
			}
		}
	};
	
	return server.public;
};



/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/

// The joi client library
//
// The main export create returns a joi client library object
//
// var Joi = require('./joi');
// var joiClient = Joi.create();
//
// a joiClient can set, get, and clear the cache associated with an
// httpRequest object.
//
// eg.
// joiClient.setCacheForRequest(req, cacheData, reply);

var URL = require('url');
var Hapi = require('hapi');
var Rules = require('./rules');
var Mongo = require('./mongo');
var Redis = require('./redis');
var RestClient = require('./restClient');


exports.connectionType = {
	MONGO: 0,
	REDIS: 1,
	REST:  2
};

var internals = {

	// The default joi create options

	defaultOptions: {
	
		port: 8089,
		address: '127.0.0.1',
		connection: exports.connectionType.MONGO,
		expiryRules: []
	},	

	// Utility to normalize key creation
	
	translateRequestToKey: function(req) {

		return req.url;
	},

	// setup joi mongo connection if needed
	
	setupMongo: function(server) {
	
		if (!internals.mongoClient) {
			
			internals.mongoClient = Mongo.create({
			
				port: server.getPort(),
				address: server.getAddress(),
				expiryRules: server.getExpiryRules()
			});
		}
	},

	// setup joi redis connection if needed
	
	setupRedis: function(server) {
	
		if (!internals.redisClient) {
			
			internals.redisClient = Redis.create({
			
				port: server.getPort(),
				address: server.getAddress(),
				expiryRules: server.getExpiryRules()
			});
		}
	},
	
	// setup joi redis connection if needed
	
	setupRestClient: function(server) {
	
		if (!internals.restClient) {
			
			internals.restClient = RestClient.create({
			
				port: server.getPort(),
				address: server.getAddress(),
				expiryRules: server.getExpiryRules()
			});
		}
	},
	
	// setup and destroy the connection
	
	setupConnection: function(server) {
	
		var conn = server.getConnectionType();
		
		if (conn==exports.connectionType.MONGO) {
		
			internals.setupMongo(server);
			
		} else if (conn==exports.connectionType.REDIS) {
		
			internals.setupRedis(server);
		
		} else if (conn==exports.connectionType.REST) {
		
			internals.setupRestClient(server);
		
		}
	},

	destroyConnection: function(server) {
	
		var conn = server.getConnectionType();
		
		if (conn==exports.connectionType.MONGO) {
		
			if (internals.mongoClient) {
			
				delete internals.mongoClient;
			}
			
		} else if (conn==exports.connectionType.REDIS) {
		
			if (internals.redisClient) {
			
				delete internals.redisClient;
			}
		
		} else if (conn==exports.connectionType.REST) {
		
			if (internals.restClient) {
			
				delete internals.restClient;
			}
		
		}
	},
	
	getClient: function(server) {
	
		internals.setupConnection(server);
		var conn = server.getConnectionType();
		
		if (conn==exports.connectionType.MONGO) {
		
			return internals.mongoClient;
			
		} else if (conn==exports.connectionType.REDIS) {
		
			return internals.redisClient;
		
		} else if (conn==exports.connectionType.REST) {
		
			return internals.restClient;
		
		}
	}
}

// End of internals

// Server class creation. the valid options are include: port
	
exports.create = function(options) {
	
	options = (options)?Hapi.Utils.merge(internals.defaultOptions, options):internals.defaultOptions;
	
	if (options.translateRequestToKey && (typeof options.translateRequestToKey)=='function') {
	
		internals.translateRequestToKey = options.translateRequestToKey;
		delete options.translateRequestToKey;
	}
	
	internals.lazyRequire(options.connectionType);
	
	var server = {
	
		public: {

			// The properties are the first methods listed
			
			// the server port 
			
			getPort: function() { 
			
				return options.port; 
			},
			
			setPort: function(port) {
			
				internals.destroyConnection(server.public); // Whenever a server variable is changed, we delete our server reference
				options.port = port;
			},
			
			// the server address 
			
			getAddress: function() { 
			
				return options.address; 
			},
			
			setAddress: function(address) {
			
				internals.destroyConnection(server.public); // Whenever a server variable is changed, we delete our server reference
				options.address = address;
			},
			
			// the server connection type 
			
			getConnectionType: function() { 
			
				return options.connectionType; 
			},
			
			setConnectionType: function(connectionType) {
			
				internals.destroyConnection(server.public); // Whenever a server variable is changed, we delete our server reference
				options.connectionType = connectionType;
			},
			
			// the cache expiration rules 
			
			getExpiryRules: function() { 
			
				return options.expiryRules; 
			},
			
			setExpiryRules: function(expiryRules) {
			
				internals.destroyConnection(server.public); // Whenever a server variable is changed, we delete our server reference
				options.expiryRules = expiryRules;
			},
			
			// The end of the properties
			
			
			// set a cache value for a request.

			setCacheForRequest: function(req, value, callbackComplete) {
			
				var key = internals.translateRequestToKey(req);
				
				if (Rules.shouldCache(key, server.public.getExpiryRules())) {
									
					var client = internals.getClient(server.public);
					
					if (client && client.setCacheForKey) {
					
						client.setCacheForKey(key, value, callbackComplete);
					}
					
				} else {
				
					// This is not a cachable request
					callbackComplete();
				}
			},
			
			// get a cache value for a request.

			getCacheForRequest: function(req, callbackValue) {
			
				var key = internals.translateRequestToKey(req);
				
				if (Rules.shouldCache(key, server.public.getExpiryRules())) {
				
					var client = internals.getClient(server.public);
					
					if (client && client.cacheForKey) {
					
						client.cacheForKey(key, callbackValue);
					}
					
				} else {
				
					// This is not a cachable request, send back null
					callbackValue(null);
				}
			},
			
			// remove a cache value for a request.

			clearCacheForRequest: function(req, callbackComplete) {
			
				var key = internals.translateRequestToKey(req);

				if (Rules.shouldCache(key, server.public.getExpiryRules())) {
					var client = internals.getClient(server.public);
					
					if (client && client.clearCacheForKey) {
					
						client.clearCacheForKey(key, callbackComplete);
					}
				} else {
				
					// This is not a cachable request
					callbackComplete();
				}
			},
			
			// remove a cache value for a request.

			end: function() {
			
				var client = internals.getClient(server.public);
				
				if (client && client.end) {
				
					client.end();
				}
				
				internals.destroyConnection(server);
			}
		}
	};
	
	return server.public;
};

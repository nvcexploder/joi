// dpedley TODO: update this
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

//
var URL = require('url');
var JoiMongo = require('./joiMongo');
var JoiRedis = require('./joiRedis');

var internals = {

	// Utility to normalize key creation
	
	translateRequestToKey: function(req) {

		return req.url;
	},

	// setup joi mongo connection if needed
	
	setupMongo: function(server) {
	
		if (!internals.joiMongo) {
			
			internals.joiMongo = JoiMongo.create({
			
				port: server.getPort(),
				address: server.getAddress()
			});
		}
	},

	// setup joi redis connection if needed
	
	setupRedis: function(server) {
	
		if (!internals.joiRedis) {
			
			internals.joiRedis = JoiRedis.create({
			
				port: server.getPort(),
				address: server.getAddress()
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
		
		}
	},

	destroyConnection: function(server) {
	
		var conn = server.getConnectionType();
		
		if (conn==exports.connectionType.MONGO) {
		
			if (internals.joiMongo) {
			
				delete internals.joiMongo;
			}
			
		} else if (conn==exports.connectionType.REDIS) {
		
			if (internals.joiRedis) {
			
				delete internals.joiRedis;
			}
		
		}
	},

	// mongo functions which translate the request to a DB call

	mongoGetCacheForRequest: function (req, callbackValue) {
		
		var key = internals.translateRequestToKey(req);
		
		internals.joiMongo.cacheForKey(key, function(result) {
				
			callbackValue(result);
		});
	},

	mongoSetCacheForRequest: function(req, value, next) {
	
		var key = internals.translateRequestToKey(req);
		
		internals.joiMongo.setCacheForKey(key, value, next);
	},
	
	mongoClearCacheForRequest: function(req, next) {
	
		var key = internals.translateRequestToKey(req);
		
		internals.joiMongo.clearCacheForKey(key, next);
	},
		
	// redis functions which translate the request to a DB call

	redisGetCacheForRequest: function (req, callbackValue) {
		
		var key = internals.translateRequestToKey(req);
		
		internals.joiRedis.cacheForKey(key, function(result) {
				
			callbackValue(result);
		});
	},

	redisSetCacheForRequest: function(req, value, next) {
	
		var key = internals.translateRequestToKey(req);
		
		internals.joiRedis.setCacheForKey(key, value, next);
	},
	
	redisClearCacheForRequest: function(req, next) {
	
		var key = internals.translateRequestToKey(req);
		
		internals.joiRedis.clearCacheForKey(key, next);
	}	
}

// End of internals

exports.connectionType = {
	MONGO: 0,
	REDIS: 1
};

// Server class creation. the valid options are include: port
	
exports.create = function(inOptions) {
	
	var defaultPort = 8089;
	var defaultAddress = '127.0.0.1';
	var defaultConnection = exports.connectionType.MONGO;
	
	if (inOptions.address) {
	
		defaultAddress = inOptions.address;
	}
	
	if (inOptions.connectionType) {
	
		defaultConnection = inOptions.connectionType;
	}
	
	// The default port for redis is different that mongo
	
	if (defaultConnection==exports.connectionType.REDIS) {
	
		defaultPort = 6379;
	}
	
	if (inOptions.port) {
	
		defaultPort = inOptions.port;
	}
	
	// dpedley TODO: rename server to something more appropriate.
	
	var server = {
	
		initialOptions: inOptions,
		
		port: defaultPort,
		
		address: defaultAddress,
		
		connectionType: defaultConnection,
		
		public: {

			// The properties are the first methods listed
			
			// the server port 
			
			getPort: function() { 
			
				return server.port; 
			},
			
			setPort: function(port) {
			
				internals.destroyConnection(server.public); // Whenever a server variable is changed, we delete our server reference
				server.port = port;
			},
			
			// the server address 
			
			getAddress: function() { 
			
				return server.address; 
			},
			
			setAddress: function(address) {
			
				internals.destroyConnection(server.public); // Whenever a server variable is changed, we delete our server reference
				server.address = address;
			},
			
			// the server connection type 
			
			getConnectionType: function() { 
			
				return server.connectionType; 
			},
			
			setConnectionType: function(connectionType) {
			
				internals.destroyConnection(server.public); // Whenever a server variable is changed, we delete our server reference
				server.connectionType = connectionType;
			},
			
			// The end of the properties
			
			
			// set a cache value for a request.

			setCacheForRequest: function(req, value, callbackComplete) {
			
				// Distribute this call to the appropriate internal call based on the connectionType

				internals.setupConnection(server.public);
				if (server.connectionType==exports.connectionType.MONGO) {
				
					internals.mongoSetCacheForRequest(req, value, callbackComplete);
					
				} else if (server.connectionType==exports.connectionType.REDIS) {
				
					internals.redisSetCacheForRequest(req, value, callbackComplete);
				
				}
			},
			
			// get a cache value for a request.

			getCacheForRequest: function(req, callbackValue) {
			
				// Distribute this call to the appropriate internal call based on the connectionType

				internals.setupConnection(server.public);
				if (server.connectionType==exports.connectionType.MONGO) {
				
					internals.mongoGetCacheForRequest(req, callbackValue);
					
				} else if (server.connectionType==exports.connectionType.REDIS) {
				
					internals.redisGetCacheForRequest(req, callbackValue);

				}
			},
			
			// remove a cache value for a request.

			clearCacheForRequest: function(req, callbackComplete) {
			
				// Distribute this call to the appropriate internal call based on the connectionType

				internals.setupConnection(server.public);
				if (server.connectionType==exports.connectionType.MONGO) {
				
					internals.mongoClearCacheForRequest(req, callbackComplete);
					
				} else if (server.connectionType==exports.connectionType.REDIS) {
				
					internals.redisClearCacheForRequest(req, callbackComplete);

				}
			},
			
			// remove a cache value for a request.

			end: function() {
			
				// Distribute this call to the appropriate internal call based on the connectionType

				internals.setupConnection(server.public);
				if (server.connectionType==exports.connectionType.MONGO) {
				
					internals.joiMongo.end();
					
				} else if (server.connectionType==exports.connectionType.REDIS) {
				
					internals.joiRedis.end();

				}
			}
		}
	};
	
	return server.public;
};

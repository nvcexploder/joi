/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/


var Redis = require('redis');
var JoiRules = require('./joiRules');

// dpedley TODO: remove debug mode.
//Redis.debug_mode = true;

var internals = {

	getClient: function(server) {
	
		return Redis.createClient(server.port, server.address, {});
	}
	
};


// Server class creation. the valid options are include: port, address
	
exports.create = function(inOptions) {
	
	var defaultPort = 6379;
	var defaultAddress = '127.0.0.1';
	var defaultExpiryRules = {};
	
	if (inOptions.port) {
	
		defaultPort = inOptions.port;
	}
	
	if (inOptions.address) {
	
		defaultAddress = inOptions.address;
	}
	
	if (inOptions.expiryRules) {
	
		defaultExpiryRules = inOptions.expiryRules;
	}
	
	var server = {
	
		initialOptions: inOptions,
		
		port: defaultPort,
		
		address: defaultAddress,
		
		expiryRules: defaultExpiryRules,
		
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
			
			// the cache expiration rules 
			
			getExpiryRules: function() { 
			
				return server.expiryRules; 
			},
			
			// The end of the properties
			
			cacheForKey: function(key, cacheOutput) {
				
				var client = internals.getClient(server);
				
				client.on("connect", function () {
				
					client.get(key, function (err, reply) {
					
						cacheOutput(reply);
						client.end();
					});
				});
			},

			setCacheForKey: function(key, entry, next) {
				
				var client = internals.getClient(server);
				
				client.on("connect", function () {
				
					client.set(key, entry, function(result) {
					
						var rule = JoiRules.expiryFromRules(key, server.public.getExpiryRules());
						
						if (rule) {
						
							// We check the caching type etc.
							// Note we already know this should be cached, that is check in joi/index
							if (rule.expires) {
							
								// joi expire is in minutes, convert to seconds here
								
								var redisTime = rule.expires * 60;
								
								client.expire(key, redisTime, function () {
								
									client.end();
								});

							} else if (rule.expiresat) {
							
								var now = Date.now();
								
								var doneDate = JoiRules.dailyExpireFromRule(rule);
								var done = doneDate.getTime();
								
								if ( now > done ) { 
								
									// The daily expired is passed for today, create the expire based on tomorrow
									done += 86400000; // One day worth of seconds
								}
								
								// Note our timestamp is in milliseconds, redis uses seconds, adjust here
								
								var redisTime = done / 1000;
								
								client.expireat(key, redisTime, function () {
								
									client.end();
								});
								
							} else {
						
								client.end();
							}
				
						} else {
						
							client.end();
						}
					});
				});
				next();
			},

			clearCacheForKey: function(key, next) {
				
				var client = internals.getClient(server);
				
				client.on("connect", function () {
				
					client.del(key, function(err) {
					
						client.end();
					});
				});
				next();
			},
			
			// Close / remove connection
			
			end: function () {
			
				// Redis doesn't need any specific end, this is kept for future use
				
			}
		}
	};
	
	return server.public;
};




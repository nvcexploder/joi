/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/


var Redis = require('redis');
var Hapi = require('hapi');
var Rules = require('./rules');

// dpedley TODO: remove debug mode.
//Redis.debug_mode = true;

var internals = {

	defaultOptions: {
	
		port: 6379,
		address: '127.0.0.1',
		expiryRules: []
	},	

	getClient: function(options) {

		var client = Redis.createClient(options.port, options.address, {});

		return client;
	}
	
};


// Server class creation. the valid options are include: port, address
	
exports.create = function(options) {
	
	options = (options)?Hapi.Utils.merge(internals.defaultOptions, options):internals.defaultOptions;
	
	var server = {
	
		public: {

			// The properties are the first methods listed
			
			// the server port 
			
			getPort: function() { 
			
				return options.port; 
			},
			
			// the server address 
			
			getAddress: function() { 
			
				return options.address; 
			},
			
			// the cache expiration rules 
			
			getExpiryRules: function() { 
			
				return options.expiryRules; 
			},
			
			// The end of the properties
			
			cacheForKey: function(key, cacheOutput) {
				
				var client = internals.getClient(options);
				
				client.on("connect", function () {
				
					client.get(key, function (err, reply) {
					    if(err === null) {
                            cacheOutput(null, reply);
                            client.end();
                        } else {
                            cacheOutput(err, null);
                        }

					});
				});

				client.on('error', function(err){
			
					Hapi.Log.err('Joi Problems: Connection errors with Redis ' + err.message);

					cacheOutput(err, null);
				});
			},

			setCacheForKey: function(key, entry, callback) {
				
				var client = internals.getClient(options);

				client.on('error', function(err){
			
					Hapi.Log.err('Joi Problems: Connection errors with Redis ' + err.message);

					callback(err);
				});
				
				client.on("connect", function () {
				
					client.set(key, entry, function(err, result) {

						if(err){
							callback(err);									
						} 

						else {
							var rule = Rules.expiryFromRules(key, server.public.getExpiryRules());
						
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
										
										var doneDate = Rules.dailyExpireFromRule(rule);
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

						}
					});
				});
				callback(null);
			},

			clearCacheForKey: function(key, next) {
				
				var client = internals.getClient(options);
				
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



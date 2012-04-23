/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/


var Redis = require('redis');
var Hapi = require('hapi');
var Rules = require('./rules');
var PoolModule = require('generic-pool');

// dpedley TODO: remove debug mode.
//Redis.debug_mode = true;

var internals = {

	defaultOptions: {
	
		port: 6379,
		address: '127.0.0.1',
		expiryRules: []
	},

	pool: PoolModule.Pool({
	    name     : 'redis',
	    create   : function(callback) {
	        var c = Redis.createClient(internals.defaultOptions.port, internals.defaultOptions.address, {});

	        c.on('error', function(err){
			
				Hapi.Log.err('Joi Problems: Connection errors with Redis ' + err.message);

				//todo: add in single-error handling on this (don't want all retries calling back)

			});

	        callback(null, c);
	    },
	    destroy  : function(client) { client.end(); },
	    max      : 10,
	    idleTimeoutMillis : 30000,
	    log : true
	}),	

	getClient: function(callback) {
		internals.pool.acquire(callback);
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
			
			cacheForKey: function(key, callback) {
				
				internals.getClient(function(err, client){

					var replied = false;
				
					client.on("connect", function () {
					
						client.get(key, function (err, reply) {
						    if(err === null) {
	                            callback(null, reply);
	                            replied = true;
	                            client.end();
	                        } else {
	                            callback(err, null);
	                            replied = true;
	                        }
						});
					});
				});
			},

			setCacheForKey: function(key, entry, callback) {
				
				internals.getClient(function(err, client) {

					if(err){
						callback(err);									
					}

					client.set(key, entry, function(error, result) {

						if(error){
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
				
				internals.getClient(options);
				
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




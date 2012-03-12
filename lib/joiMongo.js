/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/

// JOI Mongo DB utility functions

// Take a look at options such as autoreconnect in docs:
// https://github.com/christkv/node-mongodb-native/blob/master/docs/database.md

var Mongo = require('mongodb');
var Hapi = require('hapi');
var JoiRules = require('./joiRules');

var internals = {

	defaultOptions: {
	
		port: Mongo.Connection.DEFAULT_PORT,
		address: '127.0.0.1',
		expiryRules: []
	},	

	setupMongo: function(server) {
	
		if (!internals.mongoServer) {
			
			internals.mongoServer = new Mongo.Server(server.getAddress(), server.getPort(), {});
		}
		
		if (!internals.db) {
		
			internals.db = new Mongo.Db('joiCache', internals.mongoServer, {native_parser:true});
		}
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
				
				internals.setupMongo(server.public);
				
				internals.db.open(function(err, db) {

					if (db) {
						db.collection('levelOne', function(err, collection) {      

							if (collection) {
							
								collection.findOne({'url': key}, function(err, entry) {
								
									if (entry) {
									
										if (!JoiRules.isExpired(key, entry.creationDate, server.public.getExpiryRules())) {

											// The item has not expire, next check if it is stale
											
											if (!JoiRules.isStale(key, entry.creationDate, server.public.getExpiryRules())) {
										
												cacheOutput(entry.cache);
												
											} else {
											
												// The item is stale, but not expired, return it with the stale flag
											
												cacheOutput(entry.cache, true);
													
											}
											
										} else {
										
											// The cache has expired, remove it and return null
											
											console.log('Expiring key: ' + key);
											collection.remove( { 'url' : key } );
											cacheOutput(null);
										}
										
									} else {
									
										// There was no entry return without an object
										
//										console.log('No entry: ' + err);
										cacheOutput(null);
									}
								});
								
							} else {
							
								// There was no collection return without an object
								
//								console.log('No collection: ' + err);						
								cacheOutput(null);
							}
						});
						
					} else {
					
						console.log('No DB: ' + err);
						cacheOutput(null);
					}
				});
			},

			setCacheForKey: function(key, entry, next) {
				
				internals.setupMongo(server.public);
				
				internals.db.open(function(err, db) {

					if (db) {
					
						db.collection('levelOne', function(err, collection) {      

							collection.update( 
							
								{ // Will match and update existing record
									'url': key
								},
							
								{ // The new values 
									'url' : key, 
									'cache': entry,
									'creationDate': new Date()
								},
								
								{ // Update options, we want to insert if new 'upsert' = update or insert
									'upsert': true
								}
							);
							next();
						});
					} else {
					
						console.log('No DB: ' + err);
						
						next();
					}
				});
			},

			clearCacheForKey: function(key, next) {
				
				internals.setupMongo(server.public);
				
				internals.db.open(function(err, db) {

					if (db) {
					
						db.collection('levelOne', function(err, collection) {      

							collection.remove( { 'url' : key } );
							next();
						});
					} else {
					
						console.log('No DB: ' + err);
						
						next();
					}
				});
			},
			
			// Close / remove connection
			
			end: function () {
			
				internals.setupMongo(server.public);
				
				internals.db.close(); // dpedley TODO: eval close, more cleanup is needed. 
			}
		}
	};
	
	return server.public;
};




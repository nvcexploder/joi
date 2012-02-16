/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/

// JOI Mongo DB utility functions

// Take a look at options such as autoreconnect in docs:
// https://github.com/christkv/node-mongodb-native/blob/master/docs/database.md

var Mongo = require('mongodb');
var JoiRules = require('./joiRules');

var internals = {

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
	
exports.create = function(inOptions) {
	
	var defaultPort = Mongo.Connection.DEFAULT_PORT;
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
				
				internals.setupMongo(server.public);
				
				internals.db.open(function(err, db) {

					if (db) {
						db.collection('levelOne', function(err, collection) {      

							if (collection) {
							
								collection.findOne({'url': key}, function(err, entry) {
								
									if (entry) {
									
										if (!JoiRules.isExpired(key, entry.creationDate, server.public.getExpiryRules())) {
										
											cacheOutput(entry.cache);
											
										} else {
										
											// The cache has expired, remove it and return null
											// dpedley TODO: review, should this return the cache in some cases
											
											collection.remove( { 'url' : key } );
											cacheOutput(null);
										}
										
									} else {
									
										// There was no entry return without an object
										
										console.log('No entry: ' + err);
										
										cacheOutput(null);
									}
								});
								
							} else {
							
								// There was no collection return without an object
								
								console.log('No collection: ' + err);
						
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

							collection.insert( { 
								'url' : key, 
								'cache': entry,
								'creationDate': new Date()
							});
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




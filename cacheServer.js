/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/

// Load modules

var Hapi = require('hapi');
var Joi = require('lib/joi');

// Declare internals

var internals = {

	hapiConfig: {
        uri: 'http://127.0.0.1:8008',

        host: {

            domain: '127.0.0.1',
            scheme: 'http',
            port: '8008',
            authority: '127.0.0.1:8008'
        },
		
		// Authentication

		authentication: {

			loadSession: function () {}
		}
	},

	joiConfig: {
	
		port: 6379,
		address: '127.0.0.1',
		connectionType: Joi.connectionType.REDIS
	},

	getJoi: function() {
	
		if (!internals.joi) {
			
			internals.joi = Joi.create(internals.joiConfig);
		}
		
		return internals.joi;
	},
	
	getCache: function(req, reply) {
		
		var joi = internals.getJoi();
		
		console.log('*getCacheForRequest*');
		
		joi.getCacheForRequest(req, function(cache) {
		
			if (cache) {
			
				console.log('** ' + cache);
				reply({ cache: cache });
				
			} else {
			
				reply({ cache: 'none' });
			}
		});
	},

	setCache: function(req, reply) {
		
		var joi = internals.getJoi();
		
		console.log('*setCacheForKey*');
		console.log('rawBody: ' + req.hapi.rawBody);
		
		joi.setCacheForRequest(req, req.hapi.rawBody, function() {
		
			reply({ cache: req.hapi.payload });
		});
	},

	clearCache: function(req, reply) {
		
		var joi = internals.getJoi();
		
		console.log('*clearCacheForKey*');
		joi.clearCacheForRequest(req, function() {
		
				reply({ cache: 'none' });
		});
	}
};

internals.routes = [
	{ method: 'GET',    path: '*',	handler: internals.getCache,   tos: 'none', authentication: 'optional' },
	{ method: 'PUT',    path: '*',  handler: internals.setCache,   tos: 'none', authentication: 'optional' },
	{ method: 'DELETE', path: '*',  handler: internals.clearCache, tos: 'none', authentication: 'optional' }
];



// Create and configure server instance

Hapi.Process.initialize({

    name: 'Joi Cache API Server',
	
    process: { 
	
	//	runAs: 'www-data',
	},
	
	email: {

		fromName: 'Postmile',
		replyTo: 'no-reply@your.domain',
		admin: 'admin@your.domain',
		feedback: 'admin@your.domain',

		server: {

//		  port: 25,
//		  user: '',
//		  password: '',
//		  host: 'localhost',
//		  ssl: false
		}
	}
});

var server = Hapi.Server.create(internals.hapiConfig, internals.routes);

server.start();
//Stream.initialize(server.getExpress());
//Hapi.Process.finalize();


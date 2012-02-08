// JOI
// dpedley TOOD: lets get a proper doc header in here.

var Redis = require('redis');

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
	
	if (inOptions.port) {
	
		defaultPort = inOptions.port;
	}
	
	if (inOptions.address) {
	
		defaultAddress = inOptions.address;
	}
	
	var server = {
	
		initialOptions: inOptions,
		
		port: defaultPort,
		
		address: defaultAddress,
		
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
					
						client.end();
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




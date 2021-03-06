# @Walmartlabs Joi #

The joi library is meant to provide a simple cache providing key/value storage through a simple client.

Currently supported storage provided by MongoDB and Redis.

Additional client with transport to REST api with limited configuration.

A joi client provides simple methods like get and set to access data cached either as an object or raw data. Rather than a key, the get and set use a request object as its key. This allows joi to obscure the normalization of the request for hapi. 

NOTE: 
This key normalization method can be overriden using a joi configuration option:

~~~javascript
	Joi.create({ 'translateRequestToKey': myCustomKeyMethod });
~~~

There are three different transports that share cache interaction with common functions, but that differ in their configuration, here they are:

1. The REST connectionType (exports.connectionType.REST) is the most limited, it is basically just a pass-through. The assumption with the
REST connectionType is that the REST server (cacheServer.js) will have the advanced configuration options such as the expiration rules. 

2. The REDIS connectionType (exports.connectionType.REDIS) is limited in that the expiration rules are based off REDIS db commands. These 
are limited to the expires and expiresat options.

3. The MONGO connectionType (exports.connectionType.MONGO) has the expiration rules built into joi and are thus the most configurable. The 
cache items can use expires, expiresat, stalein, staleat to define when and how to remove cache items.

## Expiry ##

The server based expiry (REDIS) vs. the joi internal expiry (MONGO) mean different use cases for apps using joi.

The REDIS expiration logic is enacted on the cache being set. Thus if the expiration rules change, the existing key/value pairs will be 
ignorant of the change. REDIS cache should therefore be flushed if the rules are changed, this is up to the application.

The MONGO (aka joi internal) expiration logic is parsed when a client asks for an entry. This allows for more complex responses including a 
staleness response flag. The client app should decide based on the business content of the cache when to refresh and reset the cache entry 
based on this flag.

## Example ##

Note: you can't getCacheForRequest immediately after a setCacheForRequest it is async. 

~~~javascript
	var JoiClass = require('joi');

	var joi = JoiClass.create();

	// To clear the cache for a http request (req)
	// The anon function here will be call upon database interaction
	// completion, this is not the same timing as value being erased.
	// It is intended to be used to get failure information
	// this is TBD
	joi.clearCacheForRequest(req, callback);

	// To set the cache for a http request (req) to the data (data)
	// The callback function here will be call upon database interaction
	// completion, this is not always the same as when the value is set.
	// It is intended to be used to get failure information
	// this is TBD
	joi.setCacheForRequest(req, data, callback);

	// To get a cache entry that is related to a request call the following
	// with a http request (req) and a function which will be called
	// with a cache entry
	// [isStale] in the following is an option parameter. 
	// If it not null, it is a boolean that indicates 
	// whether the stale date has passed.
	joi.getCacheForRequest(req, function(cache, isStale) { 

	if (cache) {

		console.log('cache: ' + cache);
		
		if (isStale) {
		
			console.log('This cache entry is stale');
		}
	}	
	});
~~~
/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/

// JOI cache expiration utility functions

var internals = {

};


// expiration date checking based on routes
	
exports.expiryFromRules = function(ruleKey, expiryRules) {
	
	var defaultRule = null;
	for (var i=0; i<expiryRules.length; i++) {
		
		var rule = expiryRules[i];
		if (rule.resource=='default') {
		
			defaultRule = rule;
			
		} else {
		
			var regex = new RegExp(rule.resource, 'i'); // dpedley TODO: review is case insensitive correct here?
			var found = regex.exec(ruleKey);
			
			if (found!=null) {
			
				return rule;
			}
		}
	}
	
	return defaultRule;
};
	
exports.isExpired = function(ruleKey, creationDate, expiryRules) {
		
	var rule = exports.expiryFromRules(ruleKey, expiryRules);
	
	if (rule) {
	
		
		console.log('UTC' + creationDate.toString());
		
		if (rule.expires) {
		
			// This is a ttl expiration, so we add the expires value to the creationDate and check
			
			var done = creationDate.getTime() + ( rule.expires * 60000 ); // 60,000 milliseconds in a minute
			var now = Date.now();
			
			if (now > done) {
			
				return true;
				
			} else {
			
				return false;
				
			}
		} else if (rule.expiresat) {
		
			// This is a string representing the expiration time of day for this cache.
			// ie: '02:00' is 2AM each day
			
			var now = Date.now();
			var nowDate = new Date();
			
			console.log('expiresat');
			console.log('' +  ( nowDate.getMonth() + 1 ) + '/' + nowDate.getDate() + '/' + nowDate.getFullYear() + ' ' + rule.expiresat + ':00');
			
			var doneDate = new Date('' +  ( nowDate.getMonth() + 1 ) + '/' + nowDate.getDate() + '/' + nowDate.getFullYear() + ' ' + rule.expiresat + ':00');
			var done = doneDate.getTime();
			var created = creationDate.getTime();
			
			console.log('the timestamps: ' + now + ' - ' + created + ' - ' + done);
			
			if ( created > done ) { // This was created after the time of day, so it's not expired
			
				return false;
			
			} else if ( now < done ) { // we haven't passed the end time
			
				return false;
				
			} else {
			
				// We are expired because it's past the time and it was created before the time.
				
				return true;
				
			}
		}
	}
	
	return false;
};

exports.shouldCache = function(ruleKey, expiryRules) {
	
	var sCache = false;
	
	var rule = exports.expiryFromRules(ruleKey, expiryRules);
	
	if (rule && rule.cache) {
	
		sCache = rule.cache;
	}
	
	return sCache;
};

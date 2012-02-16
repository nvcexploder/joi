/*
* Copyright (c) 2011 Doug Pedley. All rights reserved. Copyrights licensed under the New BSD License.
* See LICENSE file included with this code project for license terms.
*/

// JOI cache expiration utility functions

var internals = {

};

// dailyExpireFromRule this function assumes the rule being passed in 
// has a daily expiry, it created the Date object based on this and 
// returns it.

exports.dateExpireFromRule = function(rule, refDate) {

	return new Date('' +  ( refDate.getMonth() + 1 ) + '/' + refDate.getDate() + '/' + refDate.getFullYear() + ' ' + rule.expiresat + ':00');			
}

// dailyExpireFromRule this function assumes the rule being passed in 
// has a daily expiry, it created the Date object based on this and 
// returns it.

exports.dailyExpireFromRule = function(rule) {

	var nowDate = new Date();
	
	return exports.dateExpireFromRule(rule, new Date());
}

// ttlFromRule this function assumes the rule being passed in 
// has a time to live expiration, it returns a timestamp (millisecs from inception) 
// and returns it.

exports.ttlFromRule = function(creationDate, rule) {

	return  creationDate.getTime() + ( rule.expires * 60000 ); // 60,000 milliseconds in a minute
}

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
	
		if (rule.expires) {
		
			// This is a ttl expiration, so we add the expires value to the creationDate and check
			
			var done = exports.ttlFromRule(creationDate, rule);
			var now = Date.now();
			
			if (now > done) {
			
				return true;
				
			}
		} 
		
		if (rule.expiresat) {
		
			// This is a string representing the expiration time of day for this cache.
			// ie: '02:00' is 2AM each day
			
			var now = Date.now();
			var created = creationDate.getTime();
			
			var doneDate = exports.dailyExpireFromRule(rule);
			var done = doneDate.getTime();
			
//			console.log('the timestamps: ' + now + ' - ' + created + ' - ' + done);
			
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

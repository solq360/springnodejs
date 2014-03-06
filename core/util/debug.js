/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var appConfig = require('../../config.js');
module.exports = {
	debug : function(){
		(appConfig.LOGDEBUG & appConfig.LOGLEVEL) &&
		console.log.apply(console, arguments);		
 	},
	error : function(){
		(appConfig.LOGERROR & appConfig.LOGLEVEL) &&
		console.error.apply(console, arguments);
	},
	info : function(){
		(appConfig.LOGINFO & appConfig.LOGLEVEL) &&
		console.info.apply(console, arguments);
	}
}
		
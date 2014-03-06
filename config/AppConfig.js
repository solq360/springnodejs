/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var appConfig={
	/**db config**/
	dbHost : '127.0.0.1',
	dbPort : 9977 , 
	dbUser : '',
	dbPasssWord : '',
	
	/**debug config**/
	LOGDEBUG : 1,
	LOGINFO : 2,
	LOGERROR : 4,
	LOGLEVEL : (1 | 4),
	
	/**web config**/
	projectName : 'REST',
	version : '0.01',
	webPort : 5555,
	
	/**web config**/	
	startCacheStatic : true,
	staticPath :  ['\\static'],
	/**auto scan config**/	
	scan :{
		'./config' : {
			injectionType : 'config'
		},
		'./aop' : {
			injectionType : 'aop'
		},
		'./service' : {
			injectionType : 'service'
		},
		'./ws' : {
			injectionType : 'controller',
			//include : [],
			exclude : ['./ws/test/test1.js']
		}
	} 
};

module.exports  = appConfig;
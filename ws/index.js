/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var fs = require('fs'),
	queryUrl = require('url'),
	_error = require('../core/util/debug.js').error;
	debug = require('../core/util/debug.js').debug,
	appConfig = require('../config.js'),
	webHelper = require('../core/util/WebHelper.js'),
	CacheQueue = require('../core/CacheQueue.js');

	
module.exports = {
	 
	'/':{
  		controller : function(req){
    			return 'xxx';
		}
	},
	'/index':{
 		controller : function(){
 			return {'code':200,data:{'xx':'测试中文'}};
		}
	}
};

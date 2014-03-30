/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var fs = require('fs'),
	queryUrl = require('url'),
	_path = require('path'),
	_error = require('../core/util/debug.js').error;
	debug = require('../core/util/debug.js').debug,
 	zlib = require("zlib");

	
module.exports = {
	auto_requestStaticFileFilter : null,
	auto_appConfig : null,
	auto_requestResultConfig : null,
 	injectionType : 'filter',
 	filterValue : null,	//拦截的url 起始标识
	order : 0,
 	awake : function(AppContext){
		this.filterValue = this.auto_appConfig.welcomeFilters; 
  	},
 	
	//过滤成功后执行的回调
	filterSuccessCallback : function(req,res,result){
		debug("read static file : ",'[',req.url,']');
		res.end();
	},
	filterProcessor : function(req, res,AppContext,pathname){		
		if(pathname=='\\' || pathname=='')
			pathname = "\\index.html";
		else{
			return this.auto_requestResultConfig.failuerValueOf();
		}
		return this.auto_requestStaticFileFilter.filterProcessor(req, res,AppContext,pathname);
 	}
};

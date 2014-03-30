/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * 总url入口拦截处理器
 * */
var fs = require('fs'),
	queryUrl = require('url'),
	_path = require('path'),
	_error = require('../core/util/debug.js').error;
	debug = require('../core/util/debug.js').debug;

	
module.exports = {
 	auto_appConfig : null,
	auto_requestResultConfig : null, 	
	injectionType : 'core',
  	filterProcessor : [],
 	awake : function(AppContext){		
		var $this=this;
		AppContext.findInjectionOfType(['filter'],null,function(container){
			$this.register(container);
		});			
		this.sort();
  	},
	sort : function(){
		this.filterProcessor.sort(function(a,b){
			if(a.order==null) return  -1;
			if(b.order==null) return  -1;
			
			return a.order<b.order ? -1 : 1;
		});		
	},
	register : function(container){
 		this.filterProcessor.push(container);		
	},	
	filter : function(req,res,AppContext){
		var _url = req.url;
		if( _url == '/favicon.ico'){
			res.end();
			return;
		}
		
		var pathname = queryUrl.parse(_url).pathname,
			pathname = _path.normalize(pathname.replace(/\.\./g, ""));	
		
		
		for(var i in  this.filterProcessor){
			var _filter = this.filterProcessor[i],
				isRight =false;
			for(var i in _filter.filterValue){		
				var checkPath =  _filter.filterValue[i];	 
				if(pathname.indexOf(checkPath)==0){			
					isRight =true;
					break;
				}
			}
			
			if(!isRight){
				continue;
			}
			
			debug(" filter name ",_filter.filterValue,pathname);
			var result = _filter.filterProcessor(req,res,AppContext,pathname);
			
			if(result!=null){
				var statu= result.statu;
				
				switch(statu){
					case this.auto_requestResultConfig.success: 
						_filter.filterSuccessCallback!=null && 
						_filter.filterSuccessCallback(req,res,result.body,statu);
						return ;
					break;
					case this.auto_requestResultConfig.callback: 
						return ;
					break;
					case this.auto_requestResultConfig.filterProcess: 
						_filter.filterSuccessCallback!=null && 
						_filter.filterSuccessCallback(req,res,result.body,statu);
					break;
				}				 
			}		
		
		}
		//404
		res.end();
		debug("not find filter ");

	}
};

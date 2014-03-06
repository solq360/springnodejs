/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var http = require("http"),
	fs = require("fs"),
	_path = require("path"),	
 	appConfig = require('./config/AppConfig.js'),
	webHelper = require('./core/util/WebHelper.js'),
	debug = require('./core/util/debug.js').debug,
	_error = require('./core/util/debug.js').error,
	AppContext={
		getKey : function(key){
			key = key.trim();
			key = key[0].toLowerCase() + key.substring(1,key.length);
			return key;
		},
		findContainer : function(key){
			key = this.getKey(key);
			return this.data[key];
		},
		addContainer : function(id,container){
			id = this.getKey(id);
			container.id= id;
			if(this.data[id]!=null ){
				_error(" injection key is has : " ,id);
				return;
			}
			this.data[id] = container;
		},
		findInjectionOfType : function(include,exclude,callBack){
			for(var i in this.data){
				var container = this.data[i];
				if(container.injectionType==null){
					continue;
				}
				var injectionType = container.injectionType;
				
				if(include!=null && include.indexOf(injectionType)<0){
					continue;
				}
				
				if(exclude!=null && exclude.indexOf(injectionType)>-1){
					continue;
				}
				
				callBack(container);	
			}
		},
		data : {}
	};
 
 //处理功能方法
var _injection = function(filePath,container){
	var id = container.id;
	if(id == null){
		id =_path.basename(filePath).replace('.js','');			
	} 	
	container.filePath = filePath ; 	
	AppContext.addContainer(id,container); 	
	return container;
}

var _auto_injection_field = function(){
	for(var id in AppContext.data){
		if(id == 'appContext'){
			continue;
		}
		var container = AppContext.findContainer(id);
		
		for(var field in container){
			if(field.indexOf('auto_')==0){
			
				var checkFn = container[field];
				if(typeof checkFn == 'function'){
					continue;
				}
				var injectionKey = field.replace('auto_','');
				
				if(AppContext.findContainer(injectionKey)==null){
					_error('injection field not find id : ',field, id );
				}else{
					container[field] = AppContext.findContainer(injectionKey);				
					debug("injection field : ",injectionKey,id )
				}			
			}			
		}		
	}
}

var _init = function(){
	//为什么分三个初始化阶段呢	
	//postConstruct 为应用层初始化，如果做服务层扩展的话，就要在应用层初始化之前准备工作，这下明了吧
	for(var id in AppContext.data){
		var container =AppContext.findContainer(id);
		container.awake!=null && container.awake(AppContext);
	}
	
	for(var id in AppContext.data){
		var container = AppContext.findContainer(id);
		container.start!=null && container.start(AppContext);
	}
	
	for(var id in AppContext.data){
		var container = AppContext.findContainer(id);
		container.postConstruct!=null && container.postConstruct(AppContext);
	}
}
 
//IOC 控制流程
// scanResource>scanService>scanController>scanAop
// end scan auto injection field
// injection aop
// init run awake > start > postConstruct 

debug( "start injection : =============================================");

webHelper.scanProcess(appConfig.scan,'.js',function(filePath,target){
	var container=require(filePath); 
	
	//injectionType 查找过滤用的
	
	if(container.injectionType==null){
		var injectionType= target.injectionType;
		if(injectionType == null){
			injectionType = 'service';
		}
		container.injectionType = injectionType;
	}
	
	//add filter 过滤器
	if(target.filter!=null){
		container.filter = target.filter;
	}
	
	var injectionType = container.injectionType ;
	var id=_injection(filePath,container).id;
 	debug( "injection : ",'[',injectionType,']','[',id,']', filePath);
});
debug( "end injection : =========================================");
debug( "=========================================");
debug( "=========================================");
debug( "=========================================");


debug( "start injection field : =============================================");
_auto_injection_field();
debug( "end injection field : =============================================");

debug( "=========================================");
debug( "=========================================");
debug( "=========================================");

//init run
debug( "start init : =============================================");
_init();
debug( "end init : =============================================");

var requestFilterProcessor = AppContext.findContainer('requestFilterProcessor');

function errorRequest(response,e){
	response.writeHead(500, {"Content-Type": "text/plain;charset=utf-8"});
	_error(e.stack,e);
	response.write(e.stack);
	response.end();
}

http.createServer(function(request, response) {

	try{
		 requestFilterProcessor.filter(request, response,AppContext);
	}catch(e){	
		errorRequest(response,e);
		return;
	}
	
	response.end(); 
  
}).listen(appConfig.webPort);
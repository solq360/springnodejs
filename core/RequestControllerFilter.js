/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var queryUrl = require("url"),
	_path = require("path"),
	queryString = require( "querystring" ),
 	debug = require('../core/util/debug.js').debug,
	_error = require('../core/util/debug.js').error,
	dateConverter = require('../core/util/dateConverter.js');

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg; 

var requestController={

	auto_requestResultConfig : null,
	auto_appConfig : null,
	
	_urlData : {},
	_pathData : {},
	//_paramData : {},
	//_pathParamData : {},
	injectionType : 'filter', //属于拦截服务
	filterValue : null,	//拦截的url 起始标识
	order : 2,
  	awake : function(AppContext){
		
		this.filterValue = this.auto_appConfig.webServiceFilters;
		
		var $this=this;
		AppContext.findInjectionOfType(['controller'],null,function(container){
			$this.register(container);
		});
	},
	/**
	保存方法参数元数据结构
	{
		sawName : 原始的参数名
		name :  参数名
		index : 参数下标
		type : 参数类型 如 string array int date object
		pathIndex : 对应路径参数下标
		mapType : 映身处理的类型 如 path param body other
		required : 是否注入 默认都为 true 
	}
	*/
	getParamMetadata : function(params,url){
		//path 处理
		if(url.lastIndexOf('/') == url.length && url.length !=1){
			url =  url.substring(0, url.length - 1).trim();
		}
 		var checkPath = url.replace(/{([^}]+)}/gm,function(a,b,c){
 			return '{}';
		});
		var checkGroup = checkPath.split("/").filter(function(e){return e}),
			sawGroup = url.split("/").filter(function(e){return e});
		
		var result = {
			queryParams : {},
 			pathParamData : {},
			paramData : {},
			otherData : {},
			bodyData : null,
			pathParamLength : 0,
			paramLength : 0,
			checkParamLength : 0,
			otherLength : 0 ,
			sawPath : url ,
			checkPath : checkPath,
			sawGroup : sawGroup,
			checkGroup : checkGroup
		};
		if(checkPath != url){
			var checkPathGroup={};
			for(var t in checkGroup){
				var __v=checkGroup[t];
				if('{'==__v[0]){
					continue;
				}
				
				checkPathGroup[t]= __v;
			}
			result.checkPathGroup = checkPathGroup;
		}
		var injectionkey = ['path_','param_','body_','def_','auto_','int_','date_','array_','object_'];
		var otherKey =['req','res','request', 'response'];
		for(var i in params){
			var param = params[i],
				name = param;
				metadata = {
					sawName : param,
					index : i,
					type : 'string',
					required : true
				};
			
			for(var j in injectionkey){
				name=name.replace(injectionkey[j],'');
			}
			
			metadata.name = name;
			
			if(result[name]!=null)
				_error('ParamMetadata register is Has: ',param, url);
			
			//参数类型处理			
			if(param.indexOf('date_')>-1){
				metadata.type = 'date';
			}else if(param.indexOf('object_')>-1){
				metadata.type = 'object';
			}else if(param.indexOf('array_')>-1){
				metadata.type = 'array';
			}else if(param.indexOf('int_')>-1){
				metadata.type = 'int';
			}
			//还有其它等等可扩展
			
			//映射类型处理
			
			if(otherKey.indexOf(param)>-1){
				metadata.mapType = 'other';
				result.otherLength++;
				if(result.otherData[name]!=null)
					_error('ParamMetadata register is Has: ',param, url);					
				
				result.otherData[name] = metadata;
				continue;
			}
			
			if(param.indexOf('path_')==0){
				metadata.mapType = 'path';
				result.pathParamLength++;
				if(result.pathParamData[name]!=null)
					_error('ParamMetadata register is Has: ',param, url);
					
				var checkKey='{'+name+'}';
				var gi=sawGroup.indexOf(checkKey);
				if(gi<0)
					_error('ParamMetadata register path key not find: ',param, url , checkKey, sawGroup);
					
				metadata.pathIndex = gi;
				result.pathParamData[name] = metadata;				
				
				continue;
			}

			if(param.indexOf('param_')==0){
				metadata.mapType = 'param';
				result.paramLength++;
				
				if(param.indexOf('def_')<0){
 					result.checkParamLength++;
					metadata.required=false;
 				}
				if(result.paramData[name]!=null)
					_error('ParamMetadata register is Has: ',param, url);
				
				result.paramData[name] = metadata;

				result.queryParams[name] = metadata.required;
				continue;
			}		
			
			if(param.indexOf('body_')==0){
				metadata.mapType = 'body';
				if(result.bodyData!=null)
					_error('ParamMetadata register is Has: ',param, url);
				result.bodyData = metadata;
				continue;
			}
		}
 
		return result;
	},
	//public function
	register : function(container){
	
		/***
			1 url 映射处理
			2 参数处理
			3 注入外部上下文
		*/
 		for(var sawUrl in container){		
		
			if(sawUrl=='id'){
				continue;
			}
			if(sawUrl.indexOf('auto_')==0){
				continue;
			}
		
			var obj = container[sawUrl] ; 
			
			if( obj == null ){
				continue;
			}
			
			if(typeof obj !='object'){
				continue;
			}
			if(obj.controller==null){			
				continue;
			}
 			
//			if(obj.methods==null || obj.methods.length==0){
//				obj.methods = ['GET'];				
//			}
			
			var methods=[],
				url = null;
			if(sawUrl.indexOf(':')<0){
				methods=['get'];
				url = sawUrl;
			}else{
				var _urlSplit= sawUrl.split(':');
				methods=_urlSplit[0].split('|') ;
				url = _urlSplit[1];
			}
 
			
			// get paramsMetadata 			
			var controller = obj.controller;
			var params = this.getParamNames(controller);
			var paramsMetadata = this.getParamMetadata(params,url);
			var filter = container.filter;			
			obj.paramsMetadata = paramsMetadata,
			obj.callObjId = container.id;			
			
  			for(var i in methods){
				var method = methods[i];				
				var key = this.getKey(method,url,filter);					
				
				if(paramsMetadata.pathParamLength!=0 ){ //有路径变量
					key = this.getKey(method,paramsMetadata.checkPath,filter);
					var groupNum = paramsMetadata.sawGroup.length;
					this.injectionPathMap(groupNum,key,obj);
				}else{
					//没有路径变量
					this.injectionUrlMap(key,obj);				
				}			 	 
				//debug("params=====",params,"url=====",url,"paramsMetadata=====",paramsMetadata);		
			}			
					
		}		
 	},	
		//过滤成功后执行的回调
	filterSuccessCallback : function(req,res,result){
		res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});

		if(result!= this.auto_requestResultConfig.success ){
			if(typeof result == 'string'){
				res.write(result);
			}else if(typeof result == 'object' 
				|| Array.isArray(result)
			){
				try{
					res.write(JSON.stringify(result));
				}catch(e){
					res.writeHead(500, {"Content-Type": "text/plain;charset=utf-8"});
					_error(e.stack,e);
					res.write(e.stack);
 				}			
			}else{
				res.write(result);
			}		
		}
		debug("controller filter : ",'[',req.url,']');
	},
	
	filterProcessor : function(request, response,AppContext){		
 
		var _url = _path.normalize(request.url);
		var method = request.method	,
			urlObj = queryUrl.parse(_url),
			path = urlObj.pathname.trim(),
 			queryObj = queryString.parse( urlObj.query );
		
		if(path.lastIndexOf('/') == path.length &  path.length!=1){
			path =  path.substring(0, path.length - 1);
		}

		var key=this.getKey(method,path),
			groupPath = path.split("/").filter(function(e){return e}) ;
		//TODO
		//auth check		
	
 		var _filter= this._urlData[key]; 		

		if(_filter==null ){
			_filter = this.findPathFilter(this._pathData,groupPath);
		}
			
		if(_filter==null ){
			_error('not find controller : ' ,key);			
			return this.auto_requestResultConfig.failuer;
		} 
		
		var  queryParams = _filter.queryParams;
		
		//check params
		for(var key in queryParams){
			var flag = queryParams[key];
			if(queryObj[key]==null && flag){				
				_error(' params is not : ',queryParams,'[',_url,']','[',_filter.callObjId,']');
				return this.auto_requestResultConfig.failuer;
			}
		}
		//param is right			
		//injection path
		//injection param
		//injection paramAndPath
		//injection other
 
		var callParams=[],
			resultMap = {},
			callObjId = _filter.callObjId,
 			controller = _filter.controller,
			paramsMetadata = _filter.paramsMetadata;
		 
		for(var name in paramsMetadata.pathParamData){
			var metadata = paramsMetadata.pathParamData[name];
			this.injectionParamProcess(request, response,AppContext,metadata,queryObj,groupPath,resultMap);
		}
		
		//paramData
		for(var name in paramsMetadata.paramData){
			var metadata = paramsMetadata.paramData[name];
			this.injectionParamProcess(request, response,AppContext,metadata,queryObj,null,resultMap);					
		}
		
		//bodyData
		if(paramsMetadata.bodyData!=null){
			this.injectionParamProcess(request, response,AppContext,paramsMetadata.bodyData,queryObj,null,resultMap);	
		}
		//otherData			
		for(var name in paramsMetadata.otherData){
			var metadata = paramsMetadata.otherData[name];
			this.injectionParamProcess(request, response,AppContext,metadata,queryObj,null,resultMap);					
		}
		
		//sort
		for(var k in resultMap){
			callParams.push(k);
		}
		for(var i in callParams){
			callParams[i]=resultMap[i];
		}
		
		var callObj = AppContext.findContainer(callObjId); 
		if(callObj == null){
			callObj = _filter;
		}
		//debug('callObjId ==============',callObjId);
		//debug('callParams ==============',callParams);
		var result = controller.apply(callObj,callParams);
		
		//返回假成功
		if(result == null){
			return this.auto_requestResultConfig.success;
		}
		
		return result;
		 		
	},
	
	
 	//private function	
	findPathFilter : function(data,groupPath){
		var _ar = data[groupPath.length];
		
		if(_ar==null) return null;
		var _filter =null;	
 		//debug("findPathFilter======", data,groupPath);
		//debug("findPathFilter======", _ar);
		for(var i in _ar){
			var _f = _ar[i];
			var paramsMetadata = _f.paramsMetadata,
				flag = true,
				checkPathGroup = paramsMetadata.checkPathGroup;
				
			
			for(var j in checkPathGroup){
				var checkValue = checkPathGroup[j];
				if( checkValue != groupPath[j] ){
					flag = false;
					break;
				}
			}
			//debug("findPathFilter======", checkPathGroup,groupPath,flag);

			if(flag){
				_filter = _f;
				break;
			}
		}
		 
		return _filter;
	},
	
	injectionParamProcess : function(request, response,AppContext,metadata,queryObj,groupPath,resultMap){
		var index = metadata.index,
			name = metadata.name,
			type = metadata.type,
			mapType = metadata.mapType,
			required = metadata.required,
			value=null;
		switch(mapType){
			case 'param' :
				value = queryObj[name];
				if(value==null && required){
					//TODO throw
					_error('injectionParam parram is null : ',name);
				}
			break;
			case 'path' : 
				var pathIndex = metadata.pathIndex;
				value = groupPath[pathIndex];				
				if(value==null){
					//TODO throw
					_error('injectionParam path is null : ',name);
				}
			break;
			case 'body' :
				value = queryObj;
			break;
			case 'other' :
				//debug(value," other value +++++++++++");
				var otherKey ={'req':request,'res':response,'request':request, 'response':response};
				value = otherKey[name];
			break;
		}
		if(value!=null ){
			switch(mapType){
				case 'path' :
				case 'param' :
				
					switch(type){
						case 'int' :
							var _v=parseInt(value);							
							if(isNaN(_v) ){
								//TODO throw
								_error('injectionParam parram num is null : ',name,value);
							}
							value=_v;
						break;
						case 'array' :					 
							if(!Array.isArray(value)){
								value=[value];
							}					 
						break;
						case 'date' :							 
							value=dateConverter.convert(value);
						break;
					}
				break;
			}
		}
		
		
		resultMap[index] = value; 			
	},

	injectionPathMap : function(groupNum,key,controller){
 		if(this._pathData[groupNum]==null){
			this._pathData[groupNum] = {};
		}
		this._pathData[groupNum][key]!=null
		&& _error("重复注册 REST injectionPathMap 处理器 : " ,key);
		debug("injectionPathMap : ",key);

		this._pathData[groupNum][key]=controller;
	},
	injectionUrlMap : function(key,controller){
		this._urlData[key]!=null
		&& _error("重复注册 REST injectionUrlMap 处理器 : " ,key);
		debug("injectionUrlMap : ",key);

		this._urlData[key]=controller;
	},
 
	getMapSize : function(map){
		var num=0;
		for(var i in map) num++;
		return num;
	},
	//cp google
	getParamNames : function(func) {
		var fnStr = func.toString().replace(STRIP_COMMENTS, '')
		var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
		if(result === null)
		 result = []
		return result
	},
	getKey : function(method,url,filter){
		url=_path.normalize(url);
 		if(url.lastIndexOf('/') == url.length && url.length!=1){
			url =  key.substring(0, url.length - 1);
		}
		if(filter==null) filter='';
		return method.toLowerCase().trim() + "_"+  filter +url.toLowerCase().trim();		
	},
};

module.exports = requestController;
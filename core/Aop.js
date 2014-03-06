/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var debug = require('../core/util/debug.js').debug,
	_error = require('../core/util/debug.js').error;

module.exports = {

	awake : function(AppContext){
		var $this=this;
		AppContext.findInjectionOfType(['aop'],null,function(container){
			$this.register(container,AppContext);
		});
	},
	//public
	register : function(container,AppContext){
		for(var key in container.before){ 
			var filter = container.before[key];
			this._aop(key,'before',filter,container, AppContext); 
		}
		
		for(var key in container.after){
			var filter = container.after[key];
			this._aop(key,'after',filter,container,AppContext); 
		}
		
		for(var key in container.error){
			var filter = container.error[key];
			this._aop(key,'error',filter,container,AppContext); 
		}
	},
	
	//private
	_aop : function(key,aopType,filter,thisObj,AppContext){
		var sp = key.split('.'),
				id = sp[0],
				fnName = key.substring(key.indexOf('.')+1, key.length );
		var container=AppContext.findContainer(id);
		if(container==null){
			_error("aop not find container : ",key, " id :",id);
			return;
		}
		
		var originalFuncton =null;
		try{
			originalFuncton = eval('container.'+ fnName);
		}catch(e){
			_error(e);
			_error("aop not find originalFuncton: ",key, " id :",id );
			return;
		}	
 		
		if(originalFuncton==null){
			_error("aop not find originalFuncton: ",key, " id :",id );
			return;
		}
		
		if(typeof originalFuncton!= "function"){
			_error("aop originalFuncton is not function ",key, " id :",id );
			return;
		}		
		
		var newFuntion=null;
		switch(aopType){
			case 'error':
				newFuntion=function(){
					try{
						originalFuncton.apply(container,arguments);
					}catch(e){
						filter.apply(thisObj,arguments);
					}					
				}
			break;			
			case 'after':
				newFuntion=function(){
					var result=originalFuncton.apply(container,arguments);
					filter.apply(thisObj,arguments);
					return result;
				}
			break;
			case 'before':
				newFuntion=function(){
					//debug("originalFuncton : " , originalFuncton.toString());
					var isCallFlag=filter.call(thisObj,originalFuncton,container,arguments);
					
					if(!isCallFlag){
						return originalFuncton.apply(container,arguments);
					}										
				}
			break;
		}	
		
		container[fnName]=newFuntion;		
	}
};
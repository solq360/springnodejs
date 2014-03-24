/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var debug = require('../core/util/debug.js').debug,
	_error = require('../core/util/debug.js').error;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg; 

module.exports = {
	injectionType : 'aop',
	awake : function(AppContext){
		var $this=this;
		var container=AppContext.findContainer('TestCallback');
		//AppContext.findInjectionOfType(null,['aop'],function(container){		
			$this.register(container);
		//});
	},
	//public
	register : function(container){
		for(var key in container){  			
			var fn = container[key];
			if(typeof fn != 'function'){
				continue;
			}
			this._aop(key,fn,container); 
		}		 
	},
	scanMarker : 'callback_',
	//private
	_aop : function(fnName,fn,container){ 
		//scan code
		//injection code
		//overrideFunction 		
		var codestring = this._scanCode(fn);
 		if(codestring.indexOf( this.scanMarker) <0 ){
			return;
		}
 		var new_codestring = this._injectionCode(codestring);
		var params = this.getParamNames(fn);
		var newFuntion = this._overrideFunction(new_codestring,params);		
		container[fnName]=newFuntion;		
		
 	},	
	getParamNames : function(func) {
		var fnStr = func.toString().replace(STRIP_COMMENTS, '')
		var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
		if(result === null)
		 result = []
		return result
	},
	_scanCode : function(fn){		
		var code=fn.toString().replace(STRIP_COMMENTS, '');
		return code.substring(code.indexOf('{')+1, code.lastIndexOf('}'));
		//return code.slice(code.indexOf('{')+1, code.lastIndexOf('}')).match(/([^\n,]+)/g).filter(function(e){return e});
	},
	_injectionCode : function(codestring){
		var _injection_start ="var __$this = this;";
 		var _injection_end ="})";
 
		var i = 0 ;
		codestring = codestring.replace(/var\s+(.*)\=.*callback_[^\)]+(.*)/mg,function(a,b,c,d){
			//debug("codestring replace ==============",a," b====== ",b," c=============== ",c, " d============== ",d);
			i++;	
 			
			var _injection_code ="function("+b+"){";
 			var result =a.replace(/\((.*)\)/,function(pa,pb){
				var r ;
				if(pb.trim()==''){
					r = "("+_injection_code;
				}else{
					r = "("+pb+","+_injection_code;
				}
				//debug("new params =========",r);
				return r;
			});
			//debug("result ====================",result);
			return result;
		});
		
		while(i>0){
			i--;
			codestring += _injection_end;			
		}
		
		//replace this
		codestring = codestring.replace(/this\s*\./mg,'__$this.');
		codestring = _injection_start + codestring;
		
		debug("new code ==============",codestring);
		return codestring;
	},
	_overrideFunction : function(new_codestring,params){
		if(params.length==0){
			return new Function(new_codestring);
		}		
		return new Function(params,new_codestring);
	},
};
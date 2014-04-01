/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var _error = require('../core/util/debug.js').error;
	debug = require('../core/util/debug.js').debug;
	
module.exports = {
	auto_sessionManager : null,
	auto_cookie : null,
	'/login':{
  		controller : function(request){
			var cookieString = request.headers.cookie; // 因为这里直接把cookie的字符串返回了,所以要方便用的话得处理一下
			var cookie = this.auto_cookie.parse(cookieString);
			
			var session = this.auto_sessionManager.createSession(66); 
			//cookie["spjsuuid"]= session.id;
			
			debug("cookie ",cookie);
		}
	},
	get : function(key){
		return cookie[key];
	},
	set : function(key,value){
		 cookie[key] = value;
		/*
		 
		  res.writeHead(200, {
			'Set-Cookie': 'SSID=Ap4GTEq; Expires=Wed, 13-Jan-2021 22:23:01 GMT;HttpOnly ',
			'Content-Type': 'text/html'
		});
		*/
	}
};

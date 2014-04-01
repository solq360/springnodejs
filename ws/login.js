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
  		controller : function(request,cookie){
  			var session = this.auto_sessionManager.createSession(555); 
 			cookie.set(SessionKey.uuid , session.id );	
			cookie.set("xxxxxx" , session.id );	
			cookie.remove("value");
			debug("cookie ", cookie.valueOf() );
			session.close();
		}
	},
	'/session':{
  		controller : function(request,cookie, session ){
				
			
			debug("session  lastTime", session.getAttr(SessionKey.lastTime));
		}
	}
};

/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var http = require("http"),
	debug = require('../core/util/debug.js').debug,
	_error = require('../core/util/debug.js').error;
	
module.exports = {
	auto_requestFilterProcessor : null,
	auto_appConfig : null,
	auto_appContext : null,
 	injectionType : 'core',
 
 	runServer : function(){
		 
		$this = this;
		http.createServer(function(request, response) {
			//响应流由拦截器内部关闭
			try{
				$this.auto_requestFilterProcessor.filter(request, response,auto_appContext);
			}catch(e){	
				$this.errorRequest(response,e);
 			}  
		}).listen($this.auto_appConfig.webPort);	
		debug("run http server ",$this.auto_appConfig.webPort);
  	},	 
	errorRequest : function(response,e){
		response.writeHead(500, {"Content-Type": "text/plain;charset=utf-8"});
		_error(e.stack,e);
		response.write(e.stack);
		response.end();
	}
};

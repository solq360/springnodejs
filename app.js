/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var appContext = require("./core/AppContext.js");

appContext.runServer();

var httpServer = appContext.findContainer("httpServer");
httpServer.runServer();
	



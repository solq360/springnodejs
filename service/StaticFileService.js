/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var fs = require('fs'),
	queryUrl = require('url'),
	_path = require('path'),
	_error = require('../core/util/debug.js').error;
	debug = require('../core/util/debug.js').debug,
	appConfig = require('../config.js'),
	webHelper = require('../core/util/WebHelper.js'),
	CacheQueue = require('../core/CacheQueue.js'),
	zlib = require("zlib");

	
module.exports = {
	CacheQueue : null,
 	//http://www.infoq.com/cn/news/2011/11/tyq-nodejs-static-file-server
	awake : function(AppContext){
		/*
		var $CacheQueue=this.CacheQueue = new CacheQueue("页面缓存",true);
		webHelper.scanProcess(appConfig.scanTpl,'.tpl',function(filePath){	
			
			var html=fs.readFileSync(filePath,'utf-8'); 
			$CacheQueue.add({
				id:	filePath,
				data : html
			});
			debug( "add cache html : ", filePath);
		});
		*/
  	},
	fileMatch: /^(gif|png|jpg|js|css)$/ig,
    maxAge: 60 * 60 * 24 * 365,
	
	getFile : function(req,res){
		var pathname = queryUrl.parse(req.url).pathname,
			realPath  = _path.join('.',_path.normalize(pathname.replace(/\.\./g, "")));
/*		var isRead =false;
		for(var i in appConfig.staticPath){
		
			var path = appConfig.staticPath[i];
			
			if(realPath.indexOf(path)==0){
			
				//realPath = _path.join(path,realPath);
				isRead =true;
				break;
			}
		}

		//if(!isRead) return false;

		if (stats.isDirectory()) {
			realPath = path.join(realPath, "/", config.Welcome.file);
		}
*/

		debug(realPath," ================== realPath" ,fs.existsSync(realPath));

		if(!fs.existsSync(realPath)){		
			return false;
		}		
		
		_path.extname(pathname);

		var lastModified = fs.statSync(realPath).mtime.toUTCString();
			res.setHeader("Last-Modified", lastModified);
 		//debug('ifModifiedSince ',req.headers,lastModified);
		var ifModifiedSince='if-modified-since';
		if (req.headers[ifModifiedSince] !=null && lastModified == req.headers[ifModifiedSince]) {
			res.writeHead(304, "Not Modified");		
			debug('write 304',pathname);
			return true;
		}
/*
		if (ext.match(this.fileMatch)) {
			var expires = new Date();
			expires.setTime(expires.getTime() + this.maxAge * 1000);
			res.setHeader("Expires", expires.toUTCString());
			res.setHeader("Cache-Control", "max-age=" + this.maxAge);			
		}*/
		 res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});	

		var html=fs.readFileSync(realPath,'utf-8'); 
		res.write(html);

 		//var raw = fs.createReadStream(realPath);	 		
		//raw.pipe(res);
		
		/*
		var raw = fs.createReadStream(realPath);
var acceptEncoding = request.headers['accept-encoding'] || "";
var matched = ext.match(config.Compress.match);
if (matched && acceptEncoding.match(/\bgzip\b/)) {
    response.writeHead(200, "Ok", {
        'Content-Encoding': 'gzip'
    });
    raw.pipe(zlib.createGzip()).pipe(response);
} else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
    response.writeHead(200, "Ok", {
        'Content-Encoding': 'deflate'
    });
    raw.pipe(zlib.createDeflate()).pipe(response);
} else {
    response.writeHead(200, "Ok");
    raw.pipe(response);
}

		*/
 		return true;
	}
};

/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var fs = require('fs'),
	queryUrl = require('url'),
	_path = require('path'),
	_error = require('../core/util/debug.js').error;
	debug = require('../core/util/debug.js').debug,
 	CacheQueue = require('../core/CacheQueue.js'),
	zlib = require("zlib");

	
module.exports = {
	auto_mime : null,
	auto_appConfig : null,
	auto_requestResultConfig : null,
	CacheQueue : null,
	injectionType : 'filter',
 	filterValue : null,	//拦截的url 起始标识
	order : 0,
 	//http://www.infoq.com/cn/news/2011/11/tyq-nodejs-static-file-server
	awake : function(AppContext){
		this.filterValue = this.auto_appConfig.staticFileFilters;

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
	fileMatch: /^(\.gif|\.png|\.jpg|\.js|\.css|\.html)$/ig,
    maxAge: 60 * 60 * 24 * 365,
	
	//过滤成功后执行的回调
	filterSuccessCallback : function(req,res,result){
		debug("read static file : ",'[',req.url,']');
	},
	filterProcessor : function(req, res,AppContext,pathname){
		
		var realPath  = _path.join('.',pathname);		
/*
		if (stats.isDirectory()) {
			realPath = path.join(realPath, "/", config.Welcome.file);
		}
*/
		
		if(!fs.existsSync(realPath)){		
			return this.auto_requestResultConfig .failuer;
		}	

		var lastModified = fs.statSync(realPath).mtime.toUTCString();
			res.setHeader("Last-Modified", lastModified);
 		//debug('ifModifiedSince ',req.headers,lastModified);
		var ifModifiedSince='if-modified-since';
		if (req.headers[ifModifiedSince] !=null && lastModified == req.headers[ifModifiedSince]) {
			res.writeHead(304, "Not Modified");		
			debug('write 304',realPath);
			return this.auto_requestResultConfig.success;
		}
		var ext = _path.extname(realPath);
		if (ext.match(this.fileMatch)) {
			var expires = new Date();
			expires.setTime(expires.getTime() + this.maxAge * 1000);
			res.setHeader("Expires", expires.toUTCString());
			res.setHeader("Cache-Control", "max-age=" + this.maxAge);		
			debug('write cache ',realPath);
		}
		var  contentType = this.auto_mime.lookup(_path.extname(realPath));
		//debug("contentType" ,contentType ,' ext :',ext,ext.match(this.fileMatch));
		res.writeHead(200, {"Content-Type":  contentType});	

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
 		return this.auto_requestResultConfig.success;
	}
};

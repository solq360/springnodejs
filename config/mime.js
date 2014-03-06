/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * plugs mime : https://github.com/broofa/node-mime
 * */
var mime = require('../plugs/mime/mime.js'),
	debug = require('../core/util/debug.js').debug,
	_path = require('path'),
	url =  require('url');
module.exports  = {	
 
	awakexx : function(){
		var pathname='../../test.php.text.html';

		debug('init mime lookup:' ,mime.lookup(pathname));
		debug('init mime lookup:' ,mime.lookup('../ws/test?xxx=bbb'));
		debug('path join:' ,_path.join("static",  pathname) );	

		var realPath = _path.join("assets", _path.normalize(pathname.replace(/\.\./g, "")));
		debug('mime realPath:' ,realPath);	
	},
	lookup : function(path){
		return mime.lookup(path);
	},
	extension : function(type){
		return mime.extension(type);
	}
};
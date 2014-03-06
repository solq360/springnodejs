/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var fs = require("fs"),
	_path = require("path");
	
function walk(dir,suffix) {
	var results = []
	var list = fs.readdirSync(dir)
	list.forEach(function(file) {
		file = dir + '/' + file
		var stat = fs.statSync(file)
		if (stat && stat.isDirectory()){
			results = results.concat(walk(file,suffix))
		}
		else {
			if(suffix!=null){
				if(suffix!=_path.extname(file)){
					return;
				}
			}
			results.push(file)
		}
	})
	return results
}
module.exports = {

	scanProcess : function(scanConfig,suffix,callFn){
		for(var dir in scanConfig){
			var files = walk(dir,suffix),
				obj = scanConfig[dir];
			
			for(var i in files){
				var filePath=files[i];
				
				if(obj.include!=null){
					if(obj.include.indexOf(filePath)<0){
						continue;
					}
				}
				
				if(obj.exclude!=null){
					if(obj.exclude.indexOf(filePath)>-1){
						continue;
					}
				}
				callFn(filePath,obj);	 
			}
		}	
	}
}
		
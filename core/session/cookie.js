/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
/// Serialize the a name value pair into a cookie string suitable for
/// http headers. An optional options object specified cookie parameters
///
/// serialize('foo', 'bar', { httpOnly: true })
///   => "foo=bar; httpOnly"
///
/// @param {String} name
/// @param {String} val
/// @param {Object} options
/// @return {String}
 
/// Parse the given cookie header string into an object
/// The object has the various cookies as keys(names) => values
/// @param {String} str
/// @return {Object}
 
var encode = encodeURIComponent;
var decode = decodeURIComponent;

module.exports ={
	def_opt : {
		httpOnly : true,
		expires : 1000*60 *60*24 * 30
	},
	serialize :   function(name, val, opt){
		opt = opt ||  this.def_opt;
		var enc = opt.encode || encode;
		var pairs = [name + '=' + enc(val)];

		if (null != opt.maxAge) {
			var maxAge = opt.maxAge - 0;
			if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
			pairs.push('max-Age=' + maxAge);
		}
		//console.log("typeof opt.expires =='date'", typeof opt.expires);
		if (opt.domain) pairs.push('domain=' + opt.domain);
		if (opt.path) pairs.push('path=' + opt.path);
		if (opt.expires) {
			if(typeof opt.expires =='number'){
				var time =  opt.expires ;
				if( opt.expires >0 ){
					time = new Date().getTime() + opt.expires ;
				}
				pairs.push('expires=' + new Date(time ).toUTCString() );
			}else{
				pairs.push('expires=' + opt.expires.toUTCString() );
			}			
		}
		if (opt.httpOnly) pairs.push('httpOnly');
		if (opt.secure) pairs.push('secure');

		return pairs.join('; ');
	},
	parse : function(str, opt) {
		opt = opt || {};
		var obj = {}
		var pairs = str.split(/; */);
		var dec = opt.decode || decode
		
		
		pairs.forEach(function(pair) {
			var eq_idx = pair.indexOf('=')

			// skip things that don't look like key=value
			if (eq_idx < 0) {
				return;
			}

			var key = pair.substr(0, eq_idx).trim()
			var val = pair.substr(++eq_idx, pair.length).trim();

			// quoted values
			if ('"' == val[0]) {
				val = val.slice(1, -1);
			}
	 			
			// only assign once
			if (undefined == obj[key]) {
				try {
					obj[key] = {
						value : dec(val)
					} ;
				} catch (e) {
					obj[key] ={
						value : val
					} ;
				}
			}
		});

		return obj;
	}
}
 
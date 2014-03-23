/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
module.exports = {	 
	callback_test1 : function(callback){
		var result = ' callback_test1 result value';
		setTimeout(function(){
			callback!=null && callback(result);
		},10000);
	}
};

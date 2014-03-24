/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
module.exports = {	 
	callback_test1 : function(callback){
		var result = ' callback_test1 result value';
		setTimeout(function(){
			  callback(result);
		},10000);
	},
	callback_test2 : function(p1,callback){
		var result = ' callback_test1 result value';
		setTimeout(function(){
			 callback(result);
		},10000);
	},
	callback_test3 : function(p2,callback){
		var result = ' callback_test1 result value';
		setTimeout(function(){
			   callback(result);
		},10000);
	}
};

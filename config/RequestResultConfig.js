/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */

module.exports  = {
	'failuer' : 'failuer',
	'success' : 'success',
	'callback' : 'callback',
	
	//返回封装
	
	'failuerValueOf' :function(body){
		return { statu : 'failuer' , body : body }
	},
	'successValueOf' :function(body){
		return { statu : 'success' , body : body   }
	},
	'callbackValueOf' :function(callback){
		return { statu : 'callback' , body : callback }
	}
};
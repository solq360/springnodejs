/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */

module.exports  = {
	'failuer' : 'failuer',	//过滤失败
	'success' : 'success',	//过滤成功
	'callback' : 'callback',//过滤成功 并且属于 callback
	'filterProcess' : 'filterProcess',	//只是拦截处理,似类于中间件
	//返回封装
	
	'failuerValueOf' :function(body){
		return { statu : 'failuer' , body : body }
	},
	'successValueOf' :function(body){
		return { statu : 'success' , body : body   }
	},
	'callbackValueOf' :function(callback){
		return { statu : 'callback' , body : callback }
	},
	'filterProcessValueOf' :function(callback){
		return { statu : 'filterProcess' , body : callback }
	}
};
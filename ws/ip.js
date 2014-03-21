/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
module.exports = {	

	postConstruct : function(){
		console.log('init  ============================');
	},

	'/testpath':{
		auth : [],//权限
 		controller : function(request, response){
			console.log("testpath",arguments);
		}
	},
	'/testpath/{p1}/{p2}':{
		auth : [],//权限
 		controller : function(path_p2,path_p1){
			console.log("testpath==",arguments);
		}
	},
	'/testparam':{
		auth : [],//权限
 		controller : function(param_p2,param_p1,body_xxx){
			console.log("testparam==",arguments);
		}
	},
	'/testpathParam/{p1}/{p2}':{
		auth : [],//权限
 		controller : function(path_int_p2,path_p1,param_p1,param_p2){
			console.log("testpathParam",arguments);
		}
	},
	'get|post:/test' :{
		controller : function(){
			console.log("test ============",arguments);
		}
		
	}
};

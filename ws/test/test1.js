module.exports = {	
	'/sss':{
		auth : [],//权限
		methods : ['GET','POST'],
		controller : function(request, response){
			console.log("hello controller");
		}
	}	 
};

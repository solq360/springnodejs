/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
module.exports = {	
	value : ' v',
	'/aio':{
  		controller : function(req, res,callback){
			var $this = this;
			setTimeout(function(){
				callback(555);
				console.log("aio end",$this.value);
			},10000);
		}
	},
	'/sync':{
  		controller : function(req, res){
			var $this = this;
			setTimeout(function(){
 				console.log("sync end",$this.value);
			},2000);
			
			
 			return " sync end";
		}
	},
	'/sleep':{
  		controller : function(req, res,callback){
			this.sleep(15000);
			return " sleep end";
		}
	},
	
	
	//private 
	sleep : function(milliSecond) {
     
		var startTime = new Date().getTime();
		 
		console.log(startTime);
		 
		while(new Date().getTime() <= milliSecond + startTime) {
			 
		}
		 
		console.log(new Date().getTime());
	}
};

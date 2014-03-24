/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
module.exports = {	
	auto_testEnhance : null,
	start : function(a,b,c){
		//debug("param =",b);
		
		debug(" arguments.callee.name ================",arguments.callee.name);
   		var value = this.auto_testEnhance.callback_test1();
		var localvalue = "localvalue";
		var value2 = this.auto_testEnhance.callback_test2(value);
		
		console.log(" test callback1 ===================", value);
		console.log(" test callback2 ===================", value2);
		console.log(" test callback3 localvalue ===================", localvalue);
	}	 
};

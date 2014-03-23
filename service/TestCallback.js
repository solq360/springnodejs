/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
module.exports = {	
	auto_testEnhance : null,
	start : function(){
		var value = this.auto_testEnhance.callback_test1();
		var value2 = this.auto_testEnhance.callback_test1();
		
		console.log(" test callback1 ===================", value);
		console.log(" test callback2 ===================", value2);
	}	 
};

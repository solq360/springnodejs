/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
module.exports = {	
	before : {
		'TestService.testAop' : function(originalFuncton,callObj,args){
			console.log('aop this is testAop before ==================');
			console.log('aop test this value',this.testFiled);
			console.log('aop arguments : ',originalFuncton,args);
		}
	},
	after : {		
		'TestService.testAop' : function(){
			console.log('aop this is testAop after ==================');			
		}
	},
 
	'testFiled' :'testFiled',
	postConstruct : function(){
		console.log('aop postConstruct');
	},
	preDestroy  : function(){
		console.log('preDestroy');
	}
};

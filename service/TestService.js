/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
module.exports = {	
	f1 :'this f1',
	auto_xxx:null,
	auto_ip:null,
	postConstruct : function(){
		console.log('postConstruct',this.auto_xxx,this.auto_ip.id);
		this.testAop("hello");
	},
	preDestroy  : function(){
		console.log('preDestroy');
	},
	testAop : function(str){
		console.log('this is TestService : ',str);
	}
};

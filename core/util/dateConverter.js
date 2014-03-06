/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var dateConverter = {},
	dateConfig=[
	"yyyy-MM",
	"yyyy-MM-dd",
	"yyyy-MM-dd HH:mm:ss",
	"HH:mm:ss",
];
for(var i in dateConfig){
	var key = dateConfig[i].length;
	dateConverter[key]= dateConfig[i];
}
module.exports = {
	dateConverter :  dateConverter,
	convert : function(str_date){
		//var key = str_date.length;
		//var config = this.dateConverter[key];
		
		return new Date(Date.parse(str_date.replace(/-/g,   "/")))
 	}
}
		
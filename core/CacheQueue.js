/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var _error = require('../core/util/debug.js').error;
	debug = require('../core/util/debug.js').debug;
(function(){
    var CacheQueue=function(name, isPermanent , weightValue,maxLength,clearTimerTime){
        //public
        this.name = name;										//缓存器名称
        this.maxLength = maxLength || 10000; 					//队列最大长度        
        this.clearTimerTime = clearTimerTime || 1000 * 60 * 10 ; //十分钟清一次队列
        this.weightValue = weightValue ||  0.6; 				//权重值，算出来低于这值的记录都清除
        //private
		this.isPermanent =  isPermanent || false; //是否永久保存;
        this.pointer = 0;   					//当前队列指针
        this.lastClearTime = 0; 				//最后一次清空缓存队列时间    
        this.queue = {};    					//数据
    }
    
    /**添加数据*/
    CacheQueue.prototype.add=function(data){	
	
        if(!this.isPermanent && this.pointe>=this.maxLength){
            //clear
            this.clearTimer();            
        }
		if(typeof data != 'object'){
			var data = {
				id : data,
				data : data
			};
		}
        var id= this.getId(data);
		if( this.queue[id] ==null){
		    this.pointer++;
		}
		data.lastTime=new Date().getTime();
		data.readNum=0;
        this.queue[id]=data;
    }
    
    /**清理数据处理器*/
    CacheQueue.prototype.clearTimer=function(){      
		var now=new Date().getTime();
        for(var key in this.queue){
            var obj= this.queue[key];            
            if(this.getWeight(obj,now)<this.weightValue){
                this.pointer--;
                delete this.queue[key];
            }                
        }
        this.lastClearTime = new Date().getTime();
    }
    
    
    /**添加数据*/
    CacheQueue.prototype.remove=function(data){        
        var id=this.getId(data);
        if(this.queue[id]!=null){
            this.pointer--;
            delete this.queue[id];
        }
    }    
    
    /**find2Id数据*/
    CacheQueue.prototype.findOne=function(data){     
        var id=this.getId(data);
        if(this.queue[id]==null){
            return null;
        }
		var obj=this.queue[id];
		this.queue[id].readNum++;
		this.queue[id].lastTime=new Date().getTime();
        return obj.data;    
    }
    
    /**查询数据 数组是引用的注意*/
    CacheQueue.prototype.findList=function(conditionCallback){
        var ar=[];
        for(var k in this.queue){
            var value=this.queue[k].data;
            if(conditionCallback(value,k)){
				this.queue[k].readNum++;
				this.queue[k].lastTime=new Date().getTime();
                ar.push(value);
            }
        }
        return ar;            
    }
    
    /**查找ID***/
    CacheQueue.prototype.getId=function(data){        
        if(typeof  data =="object"){
            if(data['id']!=null){
                return data['id'];
            }else{
                //TODO error
				_error("not find cache id : ",data);
				return null;
            }
         }
         return data;
    }
    
	/**
		打印缓存信息
    ***/
    CacheQueue.prototype.debug=function(){    
		for(var key in this){
			if(key =='queue'){
				continue;
			}	

			if(typeof this[key] =='function'){
				continue;
			}				
			debug("队列信息 : ",key ," info : ",this[key]);
		}		
    }
	
    /**权重算法
        设计思路: 1天内 大于多少次访问 最高数值是多少 如1天内 0.6得分至少访问 5次
        然后算出 最大天内最少访问次数，最低值是多少 如 10天内总访问==10次的就得分为 0.2
    ***/
    CacheQueue.prototype.getWeight=function(obj,now){    

 		var tmp = now - obj.lastTime;
		if(tmp==0){
			tmp=1;
		}
        var day = Math.ceil(86400000/tmp);    //总天 
        var dv = obj.readNum || 0;     //总访问数        
                
        var t = 0.7* ( 86400000 / tmp) ; //时间影响 时间越少，占比越大        
        var n = 0.3* ( dv / (5*day *0.7))  ;    //访问次数影响 访问次数越多，占比越大
        var weight = t+n ;		
        
        return weight;
    }
    
	module.exports = CacheQueue;
})();
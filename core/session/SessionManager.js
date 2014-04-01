/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var debug = require('../../core/util/debug.js').debug,
	_error = require('../../core/util/debug.js').error;
	
module.exports = {
	auto_sessionContext : null,
  	injectionType : 'core',
	
	awake : function(){
		this.initSessionGCProcessor();
		this.intiSessionHeartbeatProcessor();
		//test
		try{
			this.createSession(56565);
			this.createSession(56565);
			this.createSession(56565);
			this.createSession(56565);
			this.createSession(56565);
			this.createSession(56565);
			this.createSession(56565);
		}catch(er){
			debug(er);
		}		
		//debug("createSession =====",this._data);
	},		
	_data : {},	//保存会话
	_bind : {},	//绑定对象
	/** 会话基本操作 ***/
	//查找会话
	getSession : function(id){
		return this._data[id];
	},
	//创建会话
	createSession : function(bid){
		//check max session
		var _bind_array = this._bind[bid];
		if(_bind_array == null){
 			 this._bind[bid] = [];
		}else if(_bind_array.length> this.auto_sessionContext.maxSession ){
			//todo throw			
			throw Exception.valueOf('max bind session :'+bid,  Exception.ERROR_MAX_SESSION);
		}
		
		var uuid = this.getUUID().replace(/-/mg,'');
		this._bind[bid].push(uuid);
	
		var $this = this;
		var session = {
			id: uuid,			
			//state : 1, //会话状态
			//bid : bid, //绑定ID
			//lastTime : new Date(), //最后访问时间
			_attr :{}, //属性
			_msg : [], //保存推送消息
			getAllAttr : function(){ return this._attr; },
			getAttr : function(key){ return this._attr[key]; }, 						//获取属性
			removeAttr : function(key){ this._attr[key]=null ; }, 						//删除属性
			setAttr : function(key,value){  this._attr[key] = value; return this; }, 	//设置属性
			write : function(msg){ this._msg.push(msg); },								//输入准备推送的消息
			getAndPushMsg : function(){ var result = this._msg; this._msg = []; return  result; }, //获取并且推送消息
			close : function(){ this.setAttr(Sessionkey.state,0); }, 					//关闭会话
			destory : function(){ this.setAttr(Sessionkey.state,-1); }, 				//销毁会话
			replace : function(session){ var allAttr =session.getAllAttr() ; for(var key in allAttr) this._attr[key] ==null && this._attr[key]=allAttr[key];  }, //替换会话
			refreshLastTime : function(){ 												//刷新最后访问时间
				this.setAttr(Sessionkey.lastTime,new Date())
					.setAttr(Sessionkey.state,1);
			}, 
			init : function(bid){ //初始化
				this
					.setAttr(Sessionkey.lastTime,new Date())
					.setAttr(Sessionkey.bind,bid)
					.setAttr(Sessionkey.state,1);
			},
		};
		session.init(bid);
		this._data[session.id] = session;
		return session;
	},
	//替换会话
	replaceSession : function(source,target){
		var newSession = this.getSession(source),
			oldSession = this.getSession(target);
		
		if(newSession !=null && oldSession!=null){
			newSession.replace(oldSession);
			this.destorySession(oldSession.id);
		}
	},
	//销毁会话
	destorySession : function(id){
		var session = this.getSession(id);
		if(session !=null){
			session.destory();
			delete this._data[id];
			//删除绑定
			var bid = session.getAttr(Sessionkey.bind);			
			if(this._bind[bid]!=null){
				var index = this._bind[bid].indexOf(id);
				//debug("remove bid: ================",bid ," index : ",index);
				if(index >-1){
					this._bind[bid].splice(index, 1);					
					//debug("remove : ================",id);
				}
			}			
		}		
	},
	//共享会话
	sharedSession : function(){},
	
	/** 会话处理器 ***/
	//初始化会话回收处理器
	initSessionGCProcessor : function(){
		var $this = this,
			time = this.auto_sessionContext.gcTime;
		setInterval(function(){
			var now = new Date().getTime();
			var removeSessions = [];
			//find remove
			for(var i in $this._data){
				var session = $this._data[i],
					state = session.getAttr(Sessionkey.state),
					lastTime = session.getAttr(Sessionkey.lastTime);				
				if( (lastTime.getTime()+time ) < now ){
					removeSessions.push( session.id );
				}			 			
			}
			//debug("remove session bind: ",this._bind);

			//debug("run gc :",removeSessions);
			//now remove
			for(var i in removeSessions){
				$this.destorySession(removeSessions[i]);
			}
		},time);	
	},
	//初始化会话心跳检测处理器
	intiSessionHeartbeatProcessor : function(){},
	//推送消息处理器
	pushMessageProcessor : function(id){
		var session = this.getSession(id);
		if(session ==null) return null;		
		return session.getAndPushMsg();
	},	
	getUUID : function(){
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				   .toString(16)
				   .substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			 s4() + '-' + s4() + s4() + s4();
	}
};

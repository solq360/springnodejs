/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
	
module.exports = {
 	injectionType : 'config',
	//回收会话时间
	gcTime : 1000*60 *15,
	//心跳保持时间
	hbTime : 1000*2,
	//每个会话消息保存长度
	msgMaxLength : 50,
	//当超过上限时把一个提下来
	//支持同一账号多个会话
	maxSession : 5
};

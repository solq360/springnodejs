springnodejs
============

作者 : solq

blog : 
* http://www.cnblogs.com/solq/p/3574640.html
* http://www.jiaotuhao.com/
* http://www.springnodejs.com/

git : https://github.com/solq360/springnodejs

* 1.只需要添加  ws Controller 文件就行,启动自动注入 Controller

* 2.path 路径参数，请求参数自动注入

* 3.请求参数格式转换，可扩展转换类型

* 4.容器变量字段自动注入

* 5.容器初始化执行

* 6.aop 实现方法拦截

* 7.url 拦截分发

* 8.controller 添加回调处理

反正是就仿spring 那套

给自己打下广告 出售域名

各位高富帅，官二代，如果你喜欢这域名就联系一下，价钱保证合理
sell Domain
```

beyond1314.cn
1314beyond.com
xbb520.cn
0081314.com
bjl123.cn
bbwhere.cn
jiaotuhao.com
52jmm.com

```
联系QQ:360174425
 

写起文档，发觉很不容易，大家将就一下吧

框架来源：

本来想拿 nodejs 做个 ip 查询小应用的，做的时候想着把基础弄好再做应用，没想到做着做着就变成 spring 国内应该没有人做吧 

至于spring 是什么，大家上网搜下吧

我在这里简单介绍一下几个核心概念。由于我本人水平也有限，对于程序的理解也只能在这水平，还没达到深层次，有什么错的请回馈下。

IOC : 反转控制
--------------------

传统写代码方式 如 ：
```
var a={
    b : {},
    c : {},
    d : {}
}

var d ={
    da : 'xxx',
    db : 'ccc',
}

//如果我要用A来工作，是不是先将 A 对象的属于全部初始化才能工作啊？？

a.b = b.da;
a.c = b.db;
....
a.z = b.z
```
大家请思考，如果我要完成一个功能，需要七八个模块，每个模块平均要用到四五个服务/控制类，每个服务/控制 类又要用到 其它的 服务/控制 还有再加上三四个配置资源，到最后每个类都有一大堆的属性要初始化，整个项目共有二三十模块。

如果让人去管理的话会疯掉，如果这些都用程序来管理，那是件多么轻松的事啊

说真的至于 ioc怎么实义我也不了解概念，我不是学JAVA 的，我只知道他的存在至少帮我处理完以上的事件。

那好，现在怎么用程序来做上面海量工作的事情呢？ 请看JS 简单实现 ioc
```
var ar=[];
//容器 1
var o1={
    id:'o1',
    o2:null
}
//容器 2
var o2={
    id:'o2',
    o1:null
}
ar.push(o1);
ar.push(o2)

var ioc={

}
//注册容器
for(var i in ar){
    var obj=ar[i];
    ioc[obj.id]=obj;
}

//容器 属性自动注入
for(var i in ioc){
    var obj = ioc[i];

    for(var j in obj){
        if(j!='id'){
            obj[j]=ioc[j];
        }
    }
}

console.log(ioc,o1,o2)
```
没错，就是这么简单。每个容器都有自己的ID 标识，只要用来搜索定位，防止复盖。

下面是项目的核心处理 AppContext 对象用来管理项目所有的容器，

那么主有就几个工作方法 : 生成ID ，查找容器，注册容器，查找一堆相同类型容器 等 具体的规则请看代码实现吧
```
AppContext={
        getKey : function(key){
            key = key.trim();
            key = key[0].toLowerCase() + key.substring(1,key.length);
            return key;
        },
        findContainer : function(key){
            key = this.getKey(key);
            return this.data[key];
        },
        addContainer : function(id,container){
            id = this.getKey(id);
            container.id= id;
            if(this.data[id]!=null ){
                _error(" injection key is has : " ,id);
                return;
            }
            this.data[id] = container;
        },
        findInjectionOfType : function(include,exclude,callBack){
            for(var i in this.data){
                var container = this.data[i];
                if(container.injectionType==null){
                    continue;
                }
                var injectionType = container.injectionType;
                
                if(include!=null && include.indexOf(injectionType)<0){
                    continue;
                }
                
                if(exclude!=null && exclude.indexOf(injectionType)>-1){
                    continue;
                }
                
                callBack(container);    
            }
        },
        data : {}
    }
```

现在来说下注册容器一些流程：

1.scan ioc

2.auto  injection field

3.init run

1.首先要注明那些是可以注册的，那些是要过滤掉的，那些容器是分别是什么类型。如核心或者服务，控制，或者工作，或者是配置等等

最后注入的条件是什么啊等等一大堆问题要处理，程序员就是命苦，生来解决这些的

2.注入完成后，接下来就是自动注入属性，我用声明式标识来定义那些是可以注入的，请看示例
```
{
    auto_field1:null,
    auto_field3:null,
    auto_field4:null,
    auto_field5:null,
    auto_field6:null,
    auto_field20:null,
    postConstruct : function(){
    	debug('init=========================================');
    }
};
```
通过 auto_(容器ID)  来注入

3.注入完了，我们来个初化始来完成自己准备工作

大概流程可以抽象出三个方法
```
_scan();
_auto_injection_field();
_init();
 ```

 

 

自动扫描，大家用JQUERY 都知道吧，$('CSS选择器') 这样就扫描到一大堆DOM对象 $('id') $('class')

我总结了一下

用声明式标记那些对象/文件 可以是被扫描到的

下面请看项目代码实现

扫描配置 
```
var appConfig={
    /* * auto scan config* * /    
    scan :{
        './core' : {
            injectionType : 'core'
        },
        './config' : {
            injectionType : 'config'
        },
        './aop' : {
            injectionType : 'aop'
        },
        './service' : {
            injectionType : 'service'
        },
        './ws' : {
            filter : '\\ws', //url 服务 过滤器
            injectionType : 'controller',
            //include : [],
            exclude : ['./ws/test/test1.js']
        }
    } 
};
 ```

有没有注意到 injectionType 这个属于？

我目前是按目录来分配容器类型的。这些大家可以在这里扩展自己的容器类型，注入后期 。通过 AppContext.findInjectionOfType 扫描

下面是项目实现 ioc 流程

```
var _injection = function(filePath,container){
    var id = container.id;
    if(id == null){
        id =_path.basename(filePath).replace('.js','');            
    }     
    container.filePath = filePath ;     
    AppContext.addContainer(id,container);     
    return container;
}

var _auto_injection_field = function(){
    for(var id in AppContext.data){
        if(id == 'appContext'){
            continue;
        }
        var container = AppContext.findContainer(id);
        
        for(var field in container){
            if(field.indexOf('auto_')==0){
            
                var checkFn = container[field];
                if(typeof checkFn == 'function'){
                    continue;
                }
                var injectionKey = field.replace('auto_','');
                
                if(AppContext.findContainer(injectionKey)==null){
                    _error('injection field not find id : ',field, id );
                }else{
                    container[field] = AppContext.findContainer(injectionKey);                
                    debug("injection field : ",injectionKey,id )
                }            
            }            
        }        
    }
}

var _init = function(){
    //为什么分三个初始化阶段呢    
    //postConstruct 为应用层初始化，如果做服务层扩展的话，就要在应用层初始化之前准备工作，这下明了吧
    for(var id in AppContext.data){
        var container =AppContext.findContainer(id);
        container.awake!=null && container.awake(AppContext);
    }
    
    for(var id in AppContext.data){
        var container = AppContext.findContainer(id);
        container.start!=null && container.start(AppContext);
    }
    
    for(var id in AppContext.data){
        var container = AppContext.findContainer(id);
        container.postConstruct!=null && container.postConstruct(AppContext);
    }
}

var _scan = function(){
    webHelper.scanProcess(appConfig.scan,'.js',function(filePath,target){
        var container=require(filePath); 
        
        //injectionType 查找过滤用的
        
        if(container.injectionType==null){
            var injectionType= target.injectionType;
            if(injectionType == null){
                injectionType = 'service';
            }
            container.injectionType = injectionType;
        }
        
        //add filter 过滤器
        if(target.filter!=null){
            container.filter = target.filter;
        }
        
        var injectionType = container.injectionType ;
        var id=_injection(filePath,container).id;
        debug( "injection : ",'[',injectionType,']','[',id,']', filePath);
    });
}

_scan();
_auto_injection_field();
_init();
```
AOP 拦截 面向切面编程
--------------------
第一次听说估计疯了吧，呵呵也包括我

我先来引导一下：
我们写的代码最终变成
```
a();
b();
c();
d();
```
CPU从上往下读取执行，最小单位抽象为方法
大家请思考一下，程序流是从上往下执行的，如果到了项目后期，要添加某些功能，变成如下这样，那我是不是得修改原来的文件啊，这样会破坏原来的代码，可能会产生未知的BUG，这是程序员最担心受怕的事
```
a();
e();
b();
c();
d();
```
以上代码如果变成
```
a();
newFn =function(){
	e();
	b();
}
newFn();
c();
d();

or


newFn =function(){
	a();
	e();
}
newFn();
b();
c();
d();
```
这样是不是不用破坏原来的代码啊？ 

这就是面向切向编程，是的没什么高深的，找到执行的关键点，切入自己处理的逻辑，在切入点之前执行还是之后执行，甚至扩展抛异常执行等等
------------
这就是AOP的核心思想，我不明白所有的书籍为什么不会写中文？？

如果你玩过window程序 钩子，是不是觉得有点似类？？
还有一个应用是改变原来执行方法的输入参数/输出返回 这在数据类型转换应用很扩。举例:
```
var a = function(int a,Date b){
	return int c;
}

newa=function(int a,string b){
	b = Date.str2date(b);
	var c=a(a,b);
	return c+'';
}

aop.filter( if(call a?) call newa; );
```

我看过一些书籍，程序补丁就是这样玩的

下面是项目aop实现代码 :

先看AOP应用 :
```
module.exports = {	
	before : {
		'TestService.testAop' : function(originalFuncton,callObj,args){
			console.log('aop this is testAop before ==================');
			console.log('aop test this value',this.testFiled);
			console.log('aop arguments : ',originalFuncton,args);
		}
	},
	after : {		
		'TestService.testAop' : function(){ //TestService 是要拦截的容器， testAop 是拦截的方法
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

```

aop核心JS
```
/* * 
 *  @author solq
 *  @deprecated blog: cnblogs.com/solq
 *  * /
var debug = require('../core/util/debug.js').debug,
	_error = require('../core/util/debug.js').error;

module.exports = {

	awake : function(AppContext){
		var $this=this;
		AppContext.findInjectionOfType(null,null,function(container){
			$this.register(container,AppContext);
		});
	},
	//public
	register : function(container,AppContext){
		for(var key in container.before){ 
			var filter = container.before[key];
			this._aop(key,'before',filter,container, AppContext); 
		}
		
		for(var key in container.after){
			var filter = container.after[key];
			this._aop(key,'after',filter,container,AppContext); 
		}
		
		for(var key in container.error){
			var filter = container.error[key];
			this._aop(key,'error',filter,container,AppContext); 
		}
	},
	
	//private
	_aop : function(key,aopType,filter,thisObj,AppContext){
		var sp = key.split('.'),
				id = sp[0],
				fnName = key.substring(key.indexOf('.')+1, key.length );
		var container=AppContext.findContainer(id);
		if(container==null){
			_error("aop not find container : ",key, " id :",id);
			return;
		}
		
		var originalFuncton =null;
		try{
			originalFuncton = eval('container.'+ fnName);
		}catch(e){
			_error(e);
			_error("aop not find originalFuncton: ",key, " id :",id );
			return;
		}	
 		
		if(originalFuncton==null){
			_error("aop not find originalFuncton: ",key, " id :",id );
			return;
		}
		
		if(typeof originalFuncton!= "function"){
			_error("aop originalFuncton is not function ",key, " id :",id );
			return;
		}		
		
		var newFuntion=null;
		switch(aopType){
			case 'error':
				newFuntion=function(){
					try{
						originalFuncton.apply(container,arguments);
					}catch(e){
						filter.apply(thisObj,arguments);
					}					
				}
			break;			
			case 'after':
				newFuntion=function(){
					var result=originalFuncton.apply(container,arguments);
					filter.apply(thisObj,arguments);
					return result;
				}
			break;
			case 'before':
				newFuntion=function(){
					//debug("originalFuncton : " , originalFuncton.toString());
					var isCallFlag=filter.call(thisObj,originalFuncton,container,arguments);
					
					if(!isCallFlag){
						return originalFuncton.apply(container,arguments);
					}										
				}
			break;
		}	
		
		container[fnName]=newFuntion;		
	}
};
```
声明式开发
------------
我第一次见别人写java注解就完成开发了，感觉太写意哈哈.
举例之前 auto_ 标识
```
{
	auto_field1:null,
	auto_field2:null,
	auto_field3:null,
	auto_field4:null,
}
```
也可以多种声明
```
module.exports = {	
	auto_cacheDate : null,
	'delete:/user/{id}/{name}':{
  		controller : function(path_name,path_id,req, res){
  			this.auto_cacheDate="add data";
			console.log("testpath",arguments);
		}
	},
	'get|post:/user':{
  		controller : function(param_p1,param_def_array_p1,body_xxx){  			
			console.log("testpath",arguments,this.auto_cacheDate);
		}
	} 
};
```
param_def_array_ 三种声明绑定一个属性 由于JS语言没有 java @注解 我只有能想到用 标识+_ 来做程序处理，看起来有点怪怪的哈哈
上面这个是 REST 设计风格，下面会介绍的

只要声明程序预处理的时候帮你自动注了，你也可以自定义标识对应相应处理

```
{
	"声明1":"处理器1",
	"声明2":"处理器2",
	"声明3":"处理器3",
	"声明4":"处理器4",
}
```


我总结了一下，用声明式开发只在是在程序预处理的时候，为了减少程序逻辑的复杂性，加标识扫描处理，类型声明转换，添加处理器等。
这种好处也只能在预处理阶段应用很好，如果在应用层做的话就失去优势。
大家思考一下 : 本来是为了减少程序复杂性用人工去硬写入绑定，如果在应用层大量用声明的话，绝对是苦力活。
我看到有的UI框架把HTML做成声明式，那绝对是苦力活，本来用js 动态生成HTML 干掉HTML化，他反而要把功能声明依赖HTML 想到一个页面有多少个HTML标签就想死了

REST 设计风格 面向资源设计
------------

* 设计的作者将世界每样东西都看成是一种资源
* 对每种资源基本操作有:  产生(create) ,变更(change) ,删除(delete),传播 (spread) 

是不是有点像数据库 增删改查 操作啊
那好，有这种概念，跟http有什么关系呢？

一个 http url 地址就是一种资源，对每个 url 有四种基本操作

```
url							method
http://www.jiaotuhao.com/test GET 	(get data)
http://www.jiaotuhao.com/test POST 	(create data)
http://www.jiaotuhao.com/test PUT 	(change data)
http://www.jiaotuhao.com/test DELETE (delete data)
```

* 大家可能比较了解的是 post get 请求对吧，其实还有很多请求的，我不说你知道吗?
* 将这四种操作跟业务联系在一起，就变成以上这样了。
* 当然，你设计的URL 不一定按照上面规范，规则是死的人是活的

下面再举个例子，带参数的
```
url							method
http://www.jiaotuhao.com/user/{id} GET 		(get data.id=={id})
http://www.jiaotuhao.com/user/{id} POST 	(create data.id={id})
http://www.jiaotuhao.com/user/{id} PUT 		(change data.id={id})
http://www.jiaotuhao.com/user/{id} DELETE 	(delete data.id={id})
```
* ID是数据唯一记录KEY,每种记录也可以看成是一种资源。
* 而 /user/ 可以看成是业务一种处理，或者是/user/ 子资源
* 这就是面向资源设计啊,如果还是觉得抽象，看看WINDOW 资源管理器

如下是项目使用的例子 :请跟 express 对比一下

```
module.exports = {	
	'delete:/user':{
		auth : [],//权限
 		controller : function(request, response){
			console.log("testpath",arguments);
		}
	},
	'get|post:/user':{
		auth : [],//权限
 		controller : function(request, response){
			console.log("testpath",arguments);
		}
	} 
};
```

```
module.exports = {	
	cacheData : null,
	'get:/user/{id}/{name}':{
  		controller : function(path_name,path_id,req, res){
  			this.cacheData="add data";
			console.log("testpath",arguments);
		}
	},
	'get|post:/user':{
  		controller : function(param_int_p1,param_array_p2,body_xxx){  			
			console.log("testpath",arguments,this.cacheData);
		}
	} 
};
```
'get:/user/{id}/{name}' 真实请求路径 http://www.jiaotuhao.com/ws/user/bbb/ccc 
ws 是拦截服务的标识，在那里配置呢?

appconfig.js filter 属性
```
scan :{
	'./ws' : {
		filter : '\\ws', //url 服务 过滤器
		injectionType : 'controller',
		//include : [],
		exclude : ['./ws/test/test1.js']
	},
	'./api' : {
		filter : '\\api', //url 服务 过滤器
		injectionType : 'controller'
	}
} 
```
为什么要加个/ws/前缀标识呢？ 不同的服务可能处理不同，这时候只要添加相应的拦截器就满足不同的处理
比如 api 服务，他可能不需要权限验证就可以访问

* path_(pathKey) 就会自动将你想要的值注入了
* param_ 将 http://www.jiaotuhao.com/ws/user/bbb/ccc?p1=2332&p2=kkk p1参数注入
* body_ 将?p1=2332&p2=kkk 变成 json={p1:2332,p2:'kkk'}注入
* int_ array_ date_ 数据类型转换

上面这些工作，程序都帮你弄好了。做出来的程序是为别人服务的，为什么不能先为自己服务呢？

实际结合声明式开发+自动注入

REST CALLBACK 添加回调处理
------------

下面项目举例

```
module.exports = {	
	value :'xxxxx',
	'/aio':{	//注入 callback 回调方法，一定要调用才结束
  		controller : function(req, res,callback){
			var $this = this;
			console.log("sync" , this.value);
			setTimeout(function(){
				console.log("sync end ================",$this.value);		 
				callback(5555555);	//执行回调
				console.log("sync end ================",$this.value);				
			},2000);
		}
	}
};
```

上面只要在 controller 参数声明 callback 在结束时调用一下就完成工作
我大概说下流程
* 1.在程序预处理时，扫描 controller 参数，发现 callback 声明标识 标记该 controller.sync = false
* 2.url拦截完成时，进行参数注入，通过 controller.sync 进行处理
* 3.通过拦载成功，执行 拦载器 filterSuccessCallback 方法

下面是核心代码

```
//注入处理

var otherKey ={'req':request,'res':response,'request':request, 'response':response ,'callback' : function(result){ $this.filterSuccessCallback(request,response,result) ;} };
otherKey[param];

var sync = paramsMetadata.sync;
var result = controller.apply(callObj,callParams); 
if(sync){
	return this.auto_requestResultConfig.successValueOf(result);
}else{			
	return this.auto_requestResultConfig.callbackValueOf();
}

```

大家可能会觉得很模糊，只需要知道怎么调用就行了
以后会介绍一下 url 拦载器，怎么处理url拦截分发的

AOP 增强实战
------------
很多人觉得AOP很少用到，其实原理的东西看似简单/复杂，但深入理解后，应用非常之扩
通过本例将见证改变 程序员(js)的书写方式，给人印象非常深刻
哈哈，首先还是通过引导。见下面js例子
```
fn1(function(){
	fn2(function(){
		fn3(function(){
			fn4();
			.....
		});
	});
});
```
写过JS的人都知道上面的代码是多头痛，第二次看肯定有想死的感觉
假如代码变成这样
```
var v1= callback_fn1();
var v2= callback_fn2(v1);
var v3= callback_fn3(v2);

//以上是程序未运行时的代码
//通过拦截进行改写

//第一次改写
var v1= callback_fn1(function(v1){
	var v2= callback_fn2(v1);
	var v3= callback_fn3(v2);
});
//第二次改写
var v1= callback_fn1(function(v1){
	var v2= callback_fn2(function(v2){
		var v3= callback_fn3(v2);
	});
});
//第三次改写 最终代码变成这样
var v1= callback_fn1(function(v1){
	var v2= callback_fn2(function(v2){
		var v3= callback_fn3(function(v3){
			 
		});
	});
});

```
我们书写的代码是同步的，相通上面介绍声明式开发，在异步的方法添加标识，程序预处理时自动改写代码，是不是很酷啊。
下面是项目简单实现，因为改写规则太多，要完善的话要花很多精力。

首先添加个 异步的方法
testEnhance.js
```
module.exports = {	 
	callback_test1 : function(callback){
		var result = ' callback_test1 result value';
		setTimeout(function(){
			callback!=null && callback(result);
		},10000);
	}
};
```
示例代码
```
module.exports = {	
	auto_testEnhance : null,
	start : function(){
		var value = this.auto_testEnhance.callback_test1();
		var value2 = this.auto_testEnhance.callback_test1();
		
		console.log(" test callback1 ===================", value);
		console.log(" test callback2 ===================", value2);
	}	 
};
```

aop 增强核心
我先说下处理流程

* 1 先扫描 function 代码
* 2 注入增强代码
* 3 重写原来方法

流程有了，那么可以抽象出三个方法
_scanCode();
_injectionCode();
_overrideFunction();

```
/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
var debug = require('../core/util/debug.js').debug,
	_error = require('../core/util/debug.js').error;

module.exports = {
	injectionType : 'aop',
	awake : function(AppContext){
		var $this=this;
		var container=AppContext.findContainer('TestCallback');
		//AppContext.findInjectionOfType(null,['aop'],function(container){		
			$this.register(container);
		//});
	},
	//public
	register : function(container){
		for(var key in container){  			
			var fn = container[key];
			if(typeof fn != 'function'){
				continue;
			}
			this._aop(key,fn,container); 
		}		 
	},
	scanMarker : 'callback_',
	//private
	_aop : function(fnName,fn,container){ 
		//scan code
		//injection code
		//overrideFunction 		
		var codestring = this._scanCode(fn);
 		if(codestring.indexOf( this.scanMarker) <0 ){
			return;
		}
		var new_codestring = this._injectionCode(codestring);	 
		var newFuntion = this._overrideFunction(new_codestring);		
		container[fnName]=newFuntion;		
	},	
	
	_scanCode : function(fn){
		var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg; 
		var code=fn.toString().replace(STRIP_COMMENTS, '');
		return code.substring(code.indexOf('{')+1, code.lastIndexOf('}'));
		//return code.slice(code.indexOf('{')+1, code.lastIndexOf('}')).match(/([^\n,]+)/g).filter(function(e){return e});
	},
	_injectionCode : function(codestring){
		var _injection_start ="var __$this = this;";
 		var _injection_end ="})";
 
		var i = 0 ;
		codestring = codestring.replace(/(var\s+(.*)\=.*callback_[^)]+)(.*)/mg,function(a,b,c,d){
			//debug("codestring replace ==============",a," b====== ",b," c=============== ",c, " d============== ",d);
			i++;
			var _injection_code ="(function("+c+"){";
			var result =a.replace("\(\)",_injection_code);
			//debug("result ====================",result);
			return result;
		});
		
		while(i>0){
			i--;
			codestring += _injection_end;			
		}
		
		//replace this
		codestring = codestring.replace(/this\s*\./mg,'__$this.');
		codestring = _injection_start + codestring;
		
		debug("new code ==============",codestring);
		return codestring;
	},
	_overrideFunction : function(new_codestring){
		return new Function(new_codestring);
	},
};
```
好了，目前就写在这里
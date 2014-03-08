springnodejs
============

作者 : solq

blog : http://www.cnblogs.com/solq/p/3574640.html

1.只需要添加  ws Controller 文件就行,启动自动注入 Controller

2.path 路径参数，请求参数自动注入

3.请求参数格式转换，可扩展转换类型

4.容器变量字段自动注入

5.容器初始化执行

6.aop 实现方法拦截

7.url 拦截分发

反正是就仿spring 那套

git : https://github.com/solq360/springnodejs

 

写起文档，发觉很不容易，大家将就一下吧

框架来源：

本来想拿 nodejs 做个 ip 查询小应用的，做的时候想着把基础弄好再做应用，没想到做着做着就变成 spring 了

个人感觉自己做出来的东西还是挺牛的，国内应该没有人做吧

用JS 写个 spring 出来，哈哈，我就是牛

 

至于spring 是什么，大家上网搜下吧

我在这里简单介绍一下几个核心概念。由于我本人水平也有限，对于程序的理解也只能在这水平，还没达到深层次，有什么错的请回馈下。

IOC : 反转控制。
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
    auto_field20:null
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
    /**auto scan config**/    
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
好了，目前就写在这里
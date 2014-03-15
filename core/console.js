/**
 * @author solq
 * @deprecated blog: cnblogs.com/solq
 * */
//var StringDecoder = require('string_decoder').StringDecoder;
//var decoder = new StringDecoder('utf8');
//var commond= decoder.write(d);
//var _commond = d.toString('utf8', 0, d.length);
module.exports={
	_data : {},
	_isStart : false,
	register : function(key,fn){
		this._data[key]=fn;
	},
	start : function(){
		if(this._isStart) return;
		this._isStart = true;	
		
		var $this=this;		
		//init
		process.stdin.setEncoding('utf8');
		var stdin = process.openStdin();

		stdin.addListener("data", function(chunk) {
			var _commonds=chunk.replace(/\r\n/g,"");
			if(_commonds==''){
				return;
			}
			var commonds = _commonds.split(' ');			
	
			//console.log("commonds",_commonds);
			var callBack = $this._data[commonds[0]];
			if(callBack!=null){
				if(commonds.length>1){
					callBack(commonds.slice(1,commonds.length));
				}else{
					callBack();
				}				
				return;
			}			
			switch(commonds[0]){
				case 'exit':
					process.exit(0);	
					break;
			}
		});

		process.on('exit', function(code) {
			$this.end();
			console.log('exit with code:', code);
		});
	},
	end : function(){
		//stdin.end();
		//decoder.end();
	}
}
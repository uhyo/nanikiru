//It's my EventEmitter!
//Note: newListener, removeListener not available
class EventEmitter{
	private events:{[name:string]:Function[];}={};
	//max listeners number
	private maxl:number=10;
	//add
	on(name:string,listener:(...args:any[])=>void):void{
		var c=this.events[name];
		if(!c){
			c=this.events[name]=[];
		}
		c.push(listener);
		if(this.maxl && c.length>this.maxl){
			console.warn("possible EventEmitter memory leak detected.");
		}
	}
	addListener(name:string,listener:(...args:any[])=>void):void{
		this.on(name,listener);
	}
	//once
	once(name:string,listener:(...args:any[])=>void):void{
		var _t=this;
		this.on(name,handler);
		function handler(...args:any[]):void{
			listener.apply(null,args);
			_t.removeListener(name,handler);
		}
	}
	removeListener(name:string,listener:(...args:any[])=>void):void{
		var c=this.events[name];
		if(!c)return;
		this.events[name]=c.filter((x)=>{return x!==listener});
	}
	removeAllListeners(name?:string):void{
		if(name==null){
			this.events={};
		}else{
			delete this.events[name];
		}
	}
	//m
	setMaxListeners(num:number):void{
		this.maxl=num;
	}
	listeners(name:string):Function[]{
		if(!this.events[name])return [];
		return this.events[name].concat([]);
	}
	//emit
	emit(name:string,...args:any[]):void{
		var c=this.events[name];
		if(!c)return;
		for(var i=0,l=c.length;i<l;i++){
			c[i].apply(null,args);
		}
	}
	static listenerCount(emitter:EventEmitter,name:string):number{
		var c=emitter.events[name];
		if(!c)return 0;
		return c.length;
	}
}

///<reference path="panel.ts"/>
///<reference path="db.ts"/>

//マネージャ
class AppHost{
	private now:Panels.Panel=null;
	private container:HTMLElement;
	constructor(){
		this.container=document.getElementById('main');
	}
	//パネルを
	setPanel(p:Panels.Panel):void{
		this.now=p;
		//HTMLかきかえ
		this.setContent(p.getContent());
	}
	setContent(n:Node):void{
		//コンテンツ
		var c=this.container;
		while(c.firstChild)c.removeChild(c.firstChild);

		c.appendChild(n);
	}
}
//イニシャライズする
document.addEventListener("DOMContentLoaded",function(){
	var host=new AppHost();
	var db=new DB();
	db.open((result:bool)=>{
		if(result){
			var tp=new Panels.SchedulerPanel(host,db);
			host.setPanel(tp);
		}
	});
},false);

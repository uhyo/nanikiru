///<reference path="panel.ts"/>
///<reference path="db.ts"/>

//マネージャ
class AppHost{
	private now:Panels.Panel=null;
	private container:HTMLElement;
	private menuContent:HTMLElement;
	private mainContent:HTMLElement;
	constructor(private db:DB){
		this.container=document.getElementById('main');
		this.menuContent=document.createElement("div");
		this.mainContent=document.createElement("div");
		this.container.appendChild(this.menuContent);
		this.container.appendChild(this.mainContent);
		//初期化
		var me=new Panels.MenuPanel(this,db);
		this.menuContent.appendChild(me.getContent());

		var tp=new Panels.SchedulerPanel(this,db);
		this.setPanel(tp);
	}
	//パネルを
	setPanel(p:Panels.Panel):void{
		this.now=p;
		//HTMLかきかえ
		this.setContent(p.getContent());
	}
	setContent(n:Node):void{
		//コンテンツ
		var c=this.mainContent;
		while(c.firstChild)c.removeChild(c.firstChild);

		c.appendChild(n);
	}
}
//イニシャライズする
document.addEventListener("DOMContentLoaded",function(){
	var db=new DB();
	db.open((result:bool)=>{
		if(result){
			var host=new AppHost(db);
		}
	});
},false);

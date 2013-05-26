///<reference path="panel.ts"/>
///<reference path="db.ts"/>

//マネージャ
class AppHost{
	private now:Panels.Panel=null;
	private container:HTMLElement;
	private menuContent:HTMLElement;
	private mainContent:HTMLElement;
	private helpContent:HTMLElement;
	private concon:HTMLElement;
	constructor(private db:DB){
		this.container=document.getElementById('main');
		this.menuContent=document.createElement("div");
		this.concon=document.createElement("div");
		this.concon.classList.add("concon");
		this.mainContent=document.createElement("div");
		this.mainContent.classList.add("mainco");
		this.helpContent=document.createElement("div");
		this.helpContent.classList.add("helpco");
		this.container.appendChild(this.menuContent);
		this.container.appendChild(this.concon);
		this.concon.appendChild(this.mainContent);
		this.concon.appendChild(this.helpContent);
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

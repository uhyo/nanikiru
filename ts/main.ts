///<reference path="panel.ts"/>
///<reference path="db.ts"/>

//マネージャ
class AppHost{
	private panels:Panels.Panel[]=[];
	private now:Panels.Panel=null;
	private container:HTMLElement;
	constructor(){
		this.container=document.getElementById('main');
	}
	//パネルを
	setPanel(p:Panels.Panel):void{
		this.panels.push(p);
		this.now=p;
		//HTMLかきかえ
		this.setContent(p.getContent());
	}
	setContent(n:Node):void{
		//コンテンツ
		var c=this.container;
		if(c.firstChild)c.removeChild(c.firstChild);

		c.appendChild(n);
	}
}
//イニシャライズする
document.addEventListener("DOMContentLoaded",function(){
	var host=new AppHost();
	var db=new DB();
	db.open((result:bool)=>{
		if(result){
			var tp=new Panels.TopPanel(db);
			host.setPanel(tp);
		}
	});
},false);

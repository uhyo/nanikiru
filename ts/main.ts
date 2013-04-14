///<reference path="panel.ts"/>

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
	var tp=new Panels.TopPanel();
	host.setPanel(tp);
},false);

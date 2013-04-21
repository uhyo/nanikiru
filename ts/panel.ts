///<reference path="ui.ts"/>
///<reference path="db.ts"/>
//パネル
module Panels{
	//パネル
	export class Panel{
		private title:string;
		private container:HTMLElement;
		constructor(){
		}
		initContainer():HTMLElement{
			this.container=el("article",(article)=>{
				article.classList.add("panel");
				//タイトル
				article.appendChild(el("h1",(h1)=>{
					h1.textContent=this.getTitle();
				}));
			});
			return this.container;
		}
		getContent():HTMLElement{
			return this.container;
		}
		setTitle(t:string):void{
			this.title=t;
		}
		getTitle():string{
			return this.title;
		}
	}
	//トップページ
	export class TopPanel extends Panel{
		private calender:UI.Calender;
		constructor(private db:DB){
			super();
			this.setTitle("何着る? トップ");
			var c=this.initContainer();
			//カレンダー
			this.calender=new UI.Calender(db);
			this.calender.render(new Date);
			c.appendChild(this.calender.getContent());
		}
	}
	function el(name:string,callback?:(e:HTMLElement)=>void):HTMLElement{
		var result=document.createElement(name);
		if(callback)callback(result);
		return result;
	}
}

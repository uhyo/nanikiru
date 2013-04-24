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
				var title=this.getTitle();
				if(title){
					article.appendChild(el("h1",(h1)=>{
						h1.textContent=this.getTitle();
					}));
				}
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
		constructor(private db:DB){
			super();
			var c=this.initContainer();
			//優先スケジューラを探す
			var schid=Number(localStorage.getItem("lastScheduler"));
			if(!isNaN(schid)){
				schid=(<any>IDBKeyRange).lowerBound(-Infinity,false);
			}
			UI.Scheduler.getScheduler(db,schid,(result:UI.Scheduler)=>{
				if(result){
					result.render(new Date);
					c.appendChild(result.getContent());
				}else{
					c.appendChild(el("p",(p)=>{
						p.textContent="カレンダーがありません。";
					}));
				}
			});
		}
	}
	function el(name:string,callback?:(e:HTMLElement)=>void):HTMLElement{
		var result=document.createElement(name);
		if(callback)callback(result);
		return result;
	}
}

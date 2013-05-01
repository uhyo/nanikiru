///<reference path="main.ts"/>
///<reference path="ui.ts"/>
///<reference path="db.ts"/>
//パネル
module Panels{
	//パネル
	export class Panel{
		private title:string;
		private container:HTMLElement;
		constructor(private host:AppHost,private db:DB){
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
		closeManage(ui:UI.UIObject):void{
			//クローズ時の処理を記述
			if(ui instanceof UI.Scheduler || ui instanceof UI.SchedulerContainer){
			var id = ui instanceof UI.Scheduler ? (<UI.Scheduler>ui).doc.id : (<UI.SchedulerContainer>ui).id;
				//スケジューラに対する
				ui.onclose((returnValue:any)=>{
					if(returnValue==="clothGroupEdit"){
						//clothgroupを管理
						var clothgroup=new ClothGroupPanel(this.host,this.db,{
							scheduler:id,
						});
						this.host.setPanel(clothgroup);
					}
				});
			}else if(ui instanceof UI.ClothGroupList){
			}
			//共通
			ui.onclose((returnValue:any)=>{
				var result;
				result=returnValue.match(/^scheduler::(\d+)$/);
				if(result){
					//スケジューラを開きたい
					var sc=new SchedulerPanel(this.host,this.db,Number(result[1]));
					this.host.setPanel(sc);
				}

				result=returnValue.match(/^cloth::(\d+)$/);
				if(result){
					//服を開きたい
					//ここ書いてないよ!!
				}
			});
		}
	}
	//スケジューラ画面
	export class SchedulerPanel extends Panel{
		constructor(private host:AppHost,private db:DB,schedulerid?:number){
			super(host,db);
			var c=this.initContainer();
			var schid:any=schedulerid;
			if(schid==null){
				//優先スケジューラを探す
				schid=Number(localStorage.getItem("lastScheduler"));
				if(!isNaN(schid)){
					schid=(<any>IDBKeyRange).lowerBound(-Infinity,false);
				}
			}
			var container=new UI.SchedulerContainer(schid,db);
			container.open();
			c.appendChild(container.getContent());
			this.closeManage(container);
		}
	}
	export class ClothGroupPanel extends Panel{
		constructor(private host:AppHost,private db:DB,option?:{
			scheduler:number;	//scheduler id
		}){
			super(host,db);
			var c=this.initContainer();
			var list=new UI.ClothGroupList(db,option && option.scheduler);
			c.appendChild(list.getContent());
			this.closeManage(list);
		}
	}
	function el(name:string,callback?:(e:HTMLElement)=>void):HTMLElement{
		var result=document.createElement(name);
		if(callback)callback(result);
		return result;
	}
}

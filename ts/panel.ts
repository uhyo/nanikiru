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
			//共通
			ui.onclose((returnValue:any)=>{
				var result;
				if("string"===typeof returnValue){
					result=returnValue.match(/^scheduler::(\d+)$/);
					if(result){
						//スケジューラを開きたい
						var sc=new SchedulerPanel(this.host,this.db,Number(result[1]));
						this.host.setPanel(sc);
						return;
					}
					result=returnValue.match(/^clothgroup::(\w+):(\d+)$/);
					if(result){
						//服グループ
						var cgl:Panel;
						switch(result[1]){
							case "scheduler":
								//スケジューラidに対応する
								cgl=new ClothGroupListPanel(this.host,this.db,{
									scheduler:Number(result[2]),
								});
								break;
							case "id":
								//服グループidに対応する
								cgl=new ClothGroupPanel(this.host,this.db,Number(result[2]));
								break;
						}
						if(cgl){
							this.host.setPanel(cgl);
						}
						return;
					}

					result=returnValue.match(/^cloth::(\d+)$/);
					if(result){
						//服を開きたい
						var cl=new ClothPanel(this.host,this.db,Number(result[1]));
						this.host.setPanel(cl);
					}
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
	export class ClothGroupListPanel extends Panel{
		constructor(private host:AppHost,private db:DB,option?:{
			scheduler:number;	//scheduler id
		}){
			super(host,db);
			var c=this.initContainer();
			var list=new UI.ClothGroupListContainer(db,option && option.scheduler);
			c.appendChild(list.getContent());
			this.closeManage(list);
		}
	}
	export class ClothGroupPanel extends Panel{
		constructor(private host:AppHost,private db:DB,clothgroupid:number){
			super(host,db);
			var c=this.initContainer();
			var info=new UI.ClothGroupInfo(db,clothgroupid);
			c.appendChild(info.getContent());
			this.closeManage(info);
		}
	}
	export class ClothPanel extends Panel{
		constructor(private host:AppHost,private db:DB,clothid:number){
			super(host,db);
			var c=this.initContainer();
			var info=new UI.ClothInfo(db,clothid);
			c.appendChild(info.getContent());
			this.closeManage(info);
		}

	}
	function el(name:string,callback?:(e:HTMLElement)=>void):HTMLElement{
		var result=document.createElement(name);
		if(callback)callback(result);
		return result;
	}
}

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
					result=returnValue.match(/^scheduler::(\w+):(\d*)$/);
					if(result){
						//スケジューラを開きたい
						var sc:Panel;
						switch(result[1]){
							case "open":
								//普通に開く
								sc=new SchedulerPanel(this.host,this.db,{
									schedulerid:result[2] ? Number(result[2]) : null,
								});
								break;
							case "conf":
								//設定画面をいきなり開く
								sc=new SchedulerPanel(this.host,this.db,{
									schedulerid:result[2] ? Number(result[2]) : null,
									conf:true,
								});
								break;
						}
						this.host.setPanel(sc);
						return;
					}
					result=returnValue.match(/^clothgroup::(\w+):(\d*)$/);
					if(result){
						//服グループ
						var cgl:Panel;
						switch(result[1]){
							case "list":
								//全部表示
								cgl=new ClothGroupListPanel(this.host,this.db);
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
					result=returnValue.match(/^schedulerlist::$/);
					if(result){
						//スケジューラのリスト
						var sl=new SchedulerListPanel(this.host,this.db);
						this.host.setPanel(sl);
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
	//メニュー
	export class MenuPanel extends Panel{
		constructor(private host:AppHost,private db:DB){
			super(host,db);
			var c=this.initContainer();
			var menu=new UI.Menu();
			c.appendChild(menu.getContent());
			this.closeManage(menu);
		}
	}
	//スケジューラ画面
	export class SchedulerPanel extends Panel{
		constructor(private host:AppHost,private db:DB,option?:{
				schedulerid?:number;
				conf?:bool;	//最初から開くか
			}){
			super(host,db);
			if(!option){
				option={};
			}
			var c=this.initContainer();
			var schid:any=option.schedulerid;
			if(schid==null){
				//優先スケジューラを探す
				var sch=localStorage.getItem("lastScheduler");
				schid=Number(localStorage.getItem("lastScheduler"));
				if(sch==null || isNaN(schid)){
					schid=(<any>IDBKeyRange).lowerBound(-Infinity,false);
				}
			}
			var container=new UI.SchedulerContainer(schid,db);
			container.open(!!option.conf);
			c.appendChild(container.getContent());
			this.closeManage(container);
		}
	}
	//スケジューラのリスト
	export class SchedulerListPanel extends Panel{
		constructor(private host:AppHost,private db:DB,option?:{
		}){
			super(host,db);
			var c=this.initContainer();
			var list=new UI.SchedulerList(db,{});
			c.appendChild(list.getContent());
			this.closeManage(list);
		}
	}
	export class ClothGroupListPanel extends Panel{
		constructor(private host:AppHost,private db:DB){
			super(host,db);
			var c=this.initContainer();
			var list=new UI.ClothGroupListContainer(db);
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

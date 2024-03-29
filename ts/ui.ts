///<reference path="db.ts"/>
///<reference path="cloth.ts"/>
///<reference path="def.ts"/>
//additional definition
interface HTMLElement{
	hidden:bool;
	dataset:any;
}
interface HTMLTimeElement extends HTMLElement{
	dateTime:string;
}
interface HTMLDialogElement extends HTMLElement{
	open:bool;
	returnValue:string;
	show(anchor?:Element):void;
	show(anchor:MouseEvent):void;
	showModal(anchor?:Element):void;
	showModal(anchor:MouseEvent):void;
	close(returnValue?:string):void;
}
interface SVGAnimationElement extends SVGElement/*,SVGTests,SVGExternalResourcesRequired*/,ElementTimeControl{
	targetElement:SVGElement;
	getStartTime:()=>number;
	getCurrentTime:()=>number;
	getSimpleDuration:()=>number;
}
interface ElementTimeControl{
	beginElement:()=>void;
	beginElementAt:(offset:number)=>void;
	endElement:()=>void;
	endElementAt:(offset:number)=>void;
}
declare var XPathResult:any;
interface XPathResult{
};
interface XPathEvaluator{
	evaluate:(expression:string,contextNode:Node,resolver:XPathNSResolver,type:number,result?:XPathResult)=>any;
	createNSResolver:(nodeResolver:Node)=>XPathNSResolver;
}
interface XPathNSResolver{
	loopupNamespaceURI:(prefix:string)=>string;
}
interface Document extends XPathEvaluator{
}

module UI{
	//UIオブジェクト
	export class UIObject{
		private container:HTMLElement;
		private oncloses:Function[]=[];
		constructor(){
			this.container=document.createElement("div");
		}
		getContent():HTMLElement{
			return this.container;
		}
		//クローズ系
		onclose(func:Function):void{
			this.oncloses.push(func);
		}
		unclose(func:Function):void{
			this.oncloses=this.oncloses.filter((x)=>{x!==func});
		}
		close(returnValue?:any):void{
			this.oncloses.forEach((x)=>{
				x(returnValue);
			});
			//なくなりたい
		}
	}
	export class UISection extends UIObject{
		private container:HTMLElement;
		constructor(){
			super();
			this.container=document.createElement("section");
		}
	}

	//スケジューラ
	export class Scheduler extends UISection{
		public date:Date;
		public logs:{
			[index:string]:LogDoc;
		}={};
		constructor(private db:DB,public doc:SchedulerDoc){
			super();
		}
		setDate(d:Date):void{
			this.date=d;
			this.render(d);
		}
		//描画する
		render(d:Date):void{
		}
		//必要なログを描画する
		private loadLogs(d:Date,callback:()=>void):void{
			callback();
		}
		public calculateScore(logs:{
			[index:string]:LogDoc;
		},d:Date,callback?:(clothScores:{
			[index:string]:number;
		})=>void=function(){}){
			callback({});
		}
		//得るやつ
		static getScheduler(db:DB,id:number,callback:(result:Scheduler)=>void):void{
			db.getScheduler(id,(doc:SchedulerDoc)=>{
				//わーいスケジュールあったー
				if(!doc){
					callback(null);
					return;
				}
				Scheduler.makeScheduler(doc,db,callback);
			});
		}
		static makeScheduler(doc:SchedulerDoc,db:DB,callback:(result:Scheduler)=>void):void{
			var result:Scheduler=null;
			switch(doc.type){
				case "calender":
					result=new Calender(db,doc);
					break;
			}
			callback(result);
		}
		//type値と名前の対応
		static types:{[index:string]:string;}={
			"calender":"カレンダー",
		};
	}
	//カレンダー
	export class Calender extends Scheduler{
		constructor(private db:DB,public doc:SchedulerDoc){
			super(db,doc);
		}
		//この日付でカレンダーを描画
		render(d:Date):void{
			var db=this.db;
			var c=this.getContent();
			c.classList.add("calender");

			var currentMonth=d.getMonth(), currentDate=d.getDate();
			var mv=this.startDate(d);
			//まず読み込む
			this.loadLogs(d,()=>{
				var logs=this.logs;
				//カレンダーを作る
				var t=<HTMLTableElement>document.createElement("table");
				t.classList.add("calender");
				while(mv.getMonth()<=currentMonth){
					var tr=<HTMLTableRowElement>t.insertRow(-1);
					//一週間
					for(var i=0;i<7;i++){
						var dd=mv.getDate(), mn=mv.getMonth();
						//セル
						var td=tr.insertCell(-1);
						td.classList.add("datecell");
						if(i===0){
							td.classList.add("Sunday");
						}else if(i===6){
							td.classList.add("Saturday");
						}
						if(mn<currentMonth || currentMonth===mn && dd<currentDate){
							td.classList.add("past");
						}else if(currentDate===dd && currentMonth===mn){
							td.classList.add("today");
						}
						//日付をかく
						var dateStr=mv.getFullYear()+"-"+(mn+1)+"-"+dd;
						td.dataset.date=dateStr;
						td.appendChild(el("div",(div)=>{
							div.classList.add("date");
							div.appendChild(el("time",(time)=>{
								var t=<HTMLTimeElement>time;
								t.dateTime=dateStr;
								t.textContent = (mn!==currentMonth ? (mn+1)+"/" : "")+dd;
							}));
						}));
						//服情報
						if(logs[dateStr]){
							td.classList.add("haslog");
							td.appendChild(el("div",(div)=>{
								div.classList.add("dailylog");
								//服を並べる
								var clothas:number[]=[];	//挿入した服管理
								logs[dateStr].cloth.forEach((clothid:number)=>{
									db.getCloth(clothid,(clothdoc:ClothDoc)=>{
										//メイン服グループは先頭2個
										var main=this.doc.groups.slice(0,2);
										if(main.some((x)=>{
											return clothdoc.group.indexOf(x)>=0;
										})){
											//ある
											div.appendChild(Cloth.importCloth({
												type:clothdoc.type,
												patterns:clothdoc.patterns,
											}).getSVG("32px","32px"));
										}
									});
								});
							}));
						}
						mv.setDate(dd+1);
					}
				}
				//書き換える
				while(c.firstChild)c.removeChild(c.firstChild);
				//まず題
				c.appendChild(el("h1",(h1)=>{
					h1.textContent=this.doc.name;
				}));
				//メニュー
				c.appendChild(el("div",(div)=>{
					div.appendChild(el("button",(b)=>{
						var button=<HTMLButtonElement>b;
						button.title="設定";
						button.classList.add("iconbutton");
						button.appendChild(icons.gear({
							radius1:90,
							radius2:35,
							z:10,
							length:24,
							color:"#666666",
							width:"24px",
							height:"24px",
							anime:"hover",
						}));
						button.addEventListener("click",(e)=>{
							//クリックされたら:スケジューラ設定メニュー
							var modal=new ModalUI(this);
							var setting=new SchedulerConfig(this.db,this);
							modal.slide("simple",setting);
							setting.onclose((returnValue:any)=>{
								//DBを書き換えた
								if(returnValue){
									this.close(returnValue);
								}else{
									this.close("scheduler::open:"+this.doc.id);
								}
							});
						},false);
					}));
				}));
				c.appendChild(t);
				//スコア計算
				//テーブルイベント
				t.addEventListener("click",(e)=>{
					//ますを探す
					var node:HTMLElement=<HTMLElement>e.target;
					do{
						if(node.classList && node.classList.contains("datecell")){
							if(!node.classList.contains("haslog")){
								//これだ!(まだログがない)
								var thisdate=new Date(node.dataset.date);
								//開く
								var modal=new ModalUI(this);
								var dv=new DayVision(db,this);
								dv.open(thisdate);
								modal.slide("simple",dv,(returnValue:any)=>{
									if(returnValue){
										this.close(returnValue);
									}
								});
							}else{
								//ログがある（ログ閲覧）
								var modal=new ModalUI(this);
								var dl=new DayLog(db,this);
								dl.open(new Date(node.dataset.date));
								modal.slide("simple",dl,(returnValue:any)=>{
									//ここ書いてないよ!
									if(returnValue){
										this.close(returnValue);
									}
								});
								
							}
						}
					}while(node=<HTMLElement>node.parentNode);
				},false);
			});
			//ヘルプ!
			help((helpel)=>{
				helpel.appendChild(el("h1",(h1)=>{
					h1.textContent="スケジューラ";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="スケジューラには着た服を記録することができます。カレンダーのマスをクリックしましょう。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="まだ服を登録していない場合は、スケジューラの";
					p.appendChild(icons.gear({
						width:"18px",
						height:"18px",
					}));
					p.appendChild(document.createTextNode("ボタンをクリックして登録しましょう。"));
				}));
			});
		}
		//このカレンダーの最初の日付を求める
		private startDate(d:Date):Date{
			var mv=new Date(d.toJSON());	//clone
			mv.setDate(1);	//とりあえず今月のついたちにする
			//日曜まで戻す
			mv.setDate(1-mv.getDay());
			mv=zeroDate(mv);
			return mv;
		}
		private lastDate(d:Date):Date{
			var result=this.startDate(d);
			//カレンダーの右下へ
			result.setDate(result.getDate()+34);
			return result;
		}
		//ログを出す
		private loadLogs(d:Date,callback:()=>void):void{
			var st=this.startDate(d), ls=this.lastDate(d);
			var db=this.db, logs=this.logs={};
			db.eachLog({
				scheduler:this.doc.id,
				date:{
					start:st,
					end:ls,
				},
			},(log:LogDoc)=>{
				if(log==null){
					//おわり
					callback();
					return;
				}
				var thisd=log.date;
				var thisds=thisd.getFullYear()+"-"+(thisd.getMonth()+1)+"-"+thisd.getDate();
				logs[thisds]=log;
			});
		}
		//得点計算
		public calculateScore(logs:{
			[index:string]:LogDoc;
		},d:Date,callback?:(clothScores:{
			[index:string]:number;
		})=>void=function(){}):void{
			var db=this.db,doc:SchedulerDoc=this.doc;
			var cs:{
				[index:string]:number;
			}={}
			//cs format:JSON clothid array(sorted)
			var clothscores:{
				[index:number]:number;	//clothid:score
			}=<any>{};
			//全一致検出用
			var ds:{
				cloth:number[];
				badpoint:number;
			}[]=[];
			var startd=zeroDate(d);
			for(var key in logs){
				var dd=zeroDate(new Date(key));
				var sub=Math.floor((startd.getTime()-dd.getTime())/(1000*3600*24));	//日数の差
				//日数の差に応じて減点（近すぎ）
				var badpoint=0;
				if(sub===1){
					badpoint=10;
				}else if(sub===2){
					badpoint=4;
				}else if(sub===3){
					badpoint=1;
				}
				var log:LogDoc=logs[key];
				if(badpoint>0){
					log.cloth.forEach((clothid:number)=>{
						if(clothscores[clothid]==null){
							clothscores[clothid]=-badpoint;
						}else{
							clothscores[clothid]-=badpoint;
						}
					});
					ds.push({
						cloth:log.cloth,
						badpoint:badpoint,
					});
				}
			}
			//さて、出揃った。組み合わせ計算
			var mains=doc.groups.slice(0,2);
			if(mains.length===0){
				callback(cs);
				return;	//何もないじゃん!
			}
			if(mains.length===1){
				//ひとつじゃん!
				db.eachCloth({
					group:mains[0],
				},(cdoc:ClothDoc)=>{
					if(cdoc!=null){
						var keyarrstr="["+cdoc.id+"]";
						var score=cdoc.status!=="active" ? -Infinity : clothscores[cdoc.id] || 0;
						//使用回数に応じた減点
						if(cdoc.used){
							score-=cdoc.used;
						}
						if(cs[keyarrstr]==null){
							cs[keyarrstr]=score;
						}else{
							cs[keyarrstr]+=score;
						}
					}else{
						callback(cs);
					}
				});
				return;
			}
			if(mains.length===2){
				//ふたつじゃん!
				var cloths1:number[]=[];
				db.eachCloth({
					group:mains[0],
				},(cdoc:ClothDoc)=>{
					if(cdoc!=null){
						cloths1.push(cdoc.id);
						if(cdoc.status!=="active"){
							clothscores[cdoc.id]=-Infinity;
						}else if(cdoc.used){
							if(clothscores[cdoc.id]!=null){
								clothscores[cdoc.id]-=cdoc.used;
							}else{
								clothscores[cdoc.id]=-cdoc.used;
							}
						}
					}else{
						//もうない! 2つ目
						var cloths2=[];
						db.eachCloth({
							group:mains[1],
						},(cdoc:ClothDoc)=>{
							if(cdoc!=null){
								cloths2.push(cdoc.id);
								if(cdoc.status!=="active"){
									clothscores[cdoc.id]=-Infinity;
								}else if(cdoc.used){
									if(clothscores[cdoc.id]!=null){
										clothscores[cdoc.id]-=cdoc.used;
									}else{
										clothscores[cdoc.id]=-cdoc.used;
									}
								}
							}else{
								//全部調べた!
								cloths1.forEach((cid1)=>{
									cloths2.forEach((cid2)=>{
										var score=(clothscores[cid1]||0)+(clothscores[cid2]||0);
										//組み合わせのかぶりを調べる
										var keyarr=[cid1,cid2].sort();
										var keyarrstr=JSON.stringify(keyarr);
										if(cs[keyarrstr]==null){
											cs[keyarrstr]=score;
										}else{
											cs[keyarrstr]+=score;
										}
										//ぴったりの一致も調べる
										ds.forEach((obj)=>{
											if(obj.cloth.indexOf(cid1)>=0 && obj.cloth.indexOf(cid2)>=0){
												//あー・・・
												cs[keyarrstr]-=obj.badpoint;
											}
										});
									});
								});
								//できた
								callback(cs);
							}
						});
					}
				});
				return;
			}
		}
	}
	//スケジューラ設定
	export class SchedulerConfig extends UISection{
		constructor(private db:DB,private scheduler:Scheduler){
			super();
			this.open();
		}
		private open():void{
			var db=this.db, scheduler=this.scheduler, doc=scheduler.doc;
			//初期化
			var c=this.getContent();
			empty(c);
			var doc=scheduler.doc;
			c.appendChild(el("h1",(h1)=>{
				h1.appendChild(icons.gear({
					radius1:90,
					radius2:35,
					z:10,
					length:24,
					color:"#888888",
					width:"32px",
					height:"32px",
					anime:"always",
				}));
				h1.appendChild(document.createTextNode(doc.name+"の設定"));
			}));
			c.appendChild(el("form",(form)=>{
				form.appendChild(el("dl",(dl)=>{
					/*dl.appendChild(el("dt",(dt)=>{
						dt.textContent="種類";
					}));
					dl.appendChild(el("dd",(dd)=>{
						dd.appendChild(el("select",(s)=>{
							var select=<HTMLSelectElement>s;
							select.name="type";
							for(var key in Scheduler.types){
								select.add(el("option",(o)=>{
									var option=<HTMLOptionElement>o;
									option.value=key;
									option.text=Scheduler.types[key];
									//ほんとうはselect.valueでやりたいが...
									if(key===doc.type){
										option.selected=true;
									}
								}));
							}
						}));
					}));*/
					dl.appendChild(el("dt",(dt)=>{
						dt.textContent="名前";
					}));
					dl.appendChild(el("input",(i)=>{
						var input=<HTMLInputElement>i;
						input.name="name";
						input.size=30;
						input.value=doc.name;
						input.required=true;
					}));
				}));
				form.appendChild(el("p",(p)=>{
					p.appendChild(el("input",(i)=>{
						var input=<HTMLInputElement>i;
						input.type="submit";
						input.value="変更を保存";
					}));
				}));
				form.addEventListener("submit",(e)=>{
					//変更をセーブしたい
					e.preventDefault();
					//doc.type=(<HTMLInputElement>(<HTMLFormElement>form).elements["type"]).value;
					doc.name=(<HTMLInputElement>(<HTMLFormElement>form).elements["name"]).value;
					//save & close
					this.save(doc);
				},false);
			}));
			//所属するスケジューラのリストをだすぞ!
			var list=new ClothGroupList(db,{
				schedulerid:doc.id,
				add:true,
				selectadd:true,
				del:true,
			});
			list.onclose((returnValue:any)=>{
				if("string"===typeof returnValue){
					var result;
					if(result=returnValue.match(/^select;(\d+)$/)){
						//ふつうに選択
						this.close("clothgroup::id:"+result[1]);
						return;
					}else if(result=returnValue.match(/^delete;(\d+)$/)){
						//これはどける
						var cgid=Number(result[1]);
						doc.groups=doc.groups.filter((x)=>{return x!==cgid});
						this.save(doc);
						return;
					}else if(result=returnValue.match(/^add;(\d+)$/)){
						//既存のを追加
						var cgid=Number(result[1]);
						if(doc.groups.indexOf(cgid)<0){
							//ついあk
							doc.groups.push(cgid);
							this.save(doc);
						}
						return;
					}
				}
				if(returnValue){
					this.close(returnValue);
				}
			});
			c.appendChild(list.getContent());
			help((helpel)=>{
				helpel.appendChild(el("h1",(h1)=>{
					h1.textContent="スケジューラの設定";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="上部ではスケジューラの名前を変更できます。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="服を登録するには、まず服グループを登録してその中に服を登録します。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="新しい服グループを追加したら、服グループの設定画面を開いて服を登録しましょう。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="服グループは、上と下の2つ作って登録するのがおすすめです。";
				}));
			});
		}
		save(doc:SchedulerDoc):void{
			//DBに書き込む
			var db=this.db;
			db.setScheduler(doc,(result:number)=>{
				//this.close(true);	//新しいDBがほしい!
				this.open();
			});
		}
	}
	//スケジューラ付随の今日は何着る?画面
	export class DayVision extends UISection{
		constructor(private db:DB,private scheduler:Scheduler){
			super();
		}
		open(d:Date):void{
			var db=this.db, scheduler=this.scheduler;
			var c=this.getContent();
			scheduler.calculateScore(scheduler.logs,d,(clothScores)=>{
				var mains=scheduler.doc.groups.slice(0,2);	//メインの服グループ
				//テーブルをつくる
				var table=el("table",(t)=>{
					var table=<HTMLTableElement>t;
					table.classList.add("dayvision-table");
					var tr=<HTMLTableRowElement>table.insertRow(-1);
					if(mains.length===2){
						//左上のあきコマ
						((td)=>{
							td.colSpan=2, td.rowSpan=2;
						})(<HTMLTableCellElement>tr.insertCell(-1));
					}
					if(mains.length>0){
						//服をれっきょっきょ
						db.getClothGroup(mains[0],(cgdoc1:ClothGroupDoc)=>{
							var cloths1:ClothDoc[]=[];
							db.eachCloth({
								group:mains[0],
							},(cdoc:ClothDoc)=>{
								if(cdoc){
									cloths1.push(cdoc);
								}else{
									//列挙した!2つ目
									if(mains.length>1){
										db.getClothGroup(mains[1],(cgdoc2:ClothGroupDoc)=>{
											var cloths2:ClothDoc[]=[];
											db.eachCloth({
												group:mains[1],
											},(cdoc:ClothDoc)=>{
												if(cdoc){
													cloths2.push(cdoc);
												}else{
													//調べ終わったぞおおお
													if(cloths1.length>0 &&cloths2.length>0){
														//横軸
														tr.appendChild(el("th",(thh)=>{
															var th=<HTMLTableHeaderCellElement>thh;
															th.colSpan=cloths1.length;
															th.textContent=cgdoc1.name;
														}));
														//服をならべてあげる
														//cloth1のCloth週
														var c1col:Cloth[]=[];
														((tr)=>{
															cloths1.forEach((cdoc1:ClothDoc,i)=>{
																c1col[i]=Cloth.importCloth(cdoc1);
																((td)=>{
																	//td.appendChild(c1col[i].getSVG("24px","24px"));
																	td.appendChild(selectbox.cloth(cdoc1,{
																		size:"24px",
																	},(mode:string)=>{
																		this.close("cloth::"+cdoc1.id);
																	}));
																})(<HTMLTableCellElement>tr.insertCell(-1));
															});
														})(<HTMLTableRowElement>table.insertRow(-1));
														cloths2.forEach((cdoc2:ClothDoc,i)=>{
															var tr=<HTMLTableRowElement>table.insertRow(-1);
															if(i===0){
																//最初は縦軸のアレをついあk
																tr.appendChild(el("th",(thh)=>{
																	var th=<HTMLTableHeaderCellElement>thh;
																	th.rowSpan=cloths2.length;
																	th.textContent=cgdoc2.name;
																	th.classList.add("vertical-th");
																}));
															}
															var c2svg=Cloth.importCloth(cdoc2);
															//服インディケータ
															((td)=>{
																td.appendChild(selectbox.cloth(cdoc2,{
																	size:"24px",
																},(mode:string)=>{
																	this.close("cloth::"+cdoc2.id);
																}));
															})(<HTMLTableCellElement>tr.insertCell(-1));
															cloths1.forEach((cdoc1:ClothDoc,j)=>{
																((td)=>{
																	//服をいれる
																	td.appendChild(c1col[j].getSVG("32px","32px"));
																	td.appendChild(c2svg.getSVG("32px","32px"));
																	td.classList.add("cloth-option");
																	//配列をつくる
																	var cloths=[cdoc1.id,cdoc2.id];
																	cloths.sort();
																	var clothstr=JSON.stringify(cloths);
																	if(clothScores[clothstr]>-Infinity){
																		td.dataset.clotharray=clothstr;
																	}else{
																		td.classList.add("unavailable");
																	}
																})(<HTMLTableCellElement>tr.insertCell(-1));
															});
														});
													}
												}
											});
										});
									}else{
										//1つだけ
										if(cloths1.length>0){
											tr.appendChild(el("th",(thh)=>{
												var th=<HTMLTableHeaderCellElement>thh;
												th.colSpan=cloths1.length;
												th.textContent=cgdoc1.name;
											}));
											(function(tr){
												//服をぜんぶ書く
												cloths1.forEach((cloth:ClothDoc)=>{
													(function(td){
														td.appendChild(Cloth.importCloth(cloth).getSVG("32px","32px"));
														td.classList.add("cloth-option");
														if(clothScores["["+cloth.id+"]"]>-Infinity){
															td.dataset.clotharray="["+cloth.id+"]";
														}else{
															td.classList.add("unavailable");
														}
													})(<HTMLTableCellElement>tr.insertCell(-1));
												});
											})(<HTMLTableRowElement>table.insertRow(-1));
										}
									}
								}
							});
						});
					}
				});
				empty(c);
				c.classList.add("limit-width");
				c.appendChild(el("h1",(h1)=>{
					h1.textContent=(d.getMonth()+1)+"月"+d.getDate()+"日の服を選択";
				}));
				c.appendChild(table);
				//クリックイベント
				table.addEventListener("click",(e)=>{
					//ますを探す
					var node:HTMLElement=<HTMLElement>e.target;
					do{
						if(node.classList && node.classList.contains("cloth-option")){
							if(!node.classList.contains("unavailable")){
								//開く
								var modal=new ModalUI(this);
								var ddc=new DayDecision(db,scheduler);
								ddc.open(d,<number[]>JSON.parse(node.dataset.clotharray));
								modal.slide("simple",ddc,(returnValue:any)=>{
									//ここ書いてないよ!
									if(returnValue){
										this.close(returnValue);
									}
								});
							}
						}
					}while(node=<HTMLElement>node.parentNode);
				},false);
				//今日のおすすめ!!
				c.appendChild(el("section",(section)=>{
					console.log(clothScores);
					var combs:string[]=Object.keys(clothScores);
					if(combs.length>0){
						//スコア順でソート(降順)
						combs.sort((a,b)=>{
							return clothScores[b]-clothScores[a];
						});
						//一番いいのを取り出す
						combs=combs.filter((x)=>{
							return clothScores[x]===clothScores[combs[0]];
						});
						console.log(combs);
						//複数あったらランダムで選ぶ
						var osusume=<number[]>JSON.parse(combs[Math.floor(combs.length*Math.random())]);
						console.log(osusume);
						section.appendChild(el("h1",(h1)=>{
							h1.textContent="おすすめの組み合わせ";
						}));
						section.appendChild(el("div",(div)=>{
							div.classList.add("cloth-option");
							db.getClothes(osusume,(cdocs:ClothDoc[])=>{
								cdocs.forEach((cdoc)=>{
									div.appendChild(Cloth.importCloth(cdoc).getSVG("32px","32px"));
								});
							});
							div.addEventListener("click",(e)=>{
								//ひょえーーーー
								var modal=new ModalUI(this);
								var ddc=new DayDecision(db,scheduler);
								ddc.open(d,osusume);
								modal.slide("simple",ddc,(returnValue:any)=>{
									if(returnValue){
										this.close(returnValue);
									}
								});
							},false);
						}));
					}
				}));
			});
			help((helpel)=>{
				helpel.appendChild(el("h1",(h1)=>{
					h1.textContent="服の選択";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="服を選択する画面では、服の候補一覧が表示されています。クリックすると選択できます。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="まだ服を登録していない場合は何も表示されないので、先に服グループと服を登録しましょう。";
				}));
			});
		}
	}
	export class DayDecision extends UISection{
		constructor(private db:DB,private scheduler:Scheduler){
			super();
		}
		open(d:Date,cloth:number[]):void{
			//cloth: 服IDを列挙 sorted
			var original_cloth=cloth;
			cloth=cloth.concat([]);	//非破壊的
			d=zeroDate(d);
			var db=this.db, scheduler=this.scheduler;
			//ここ書いてないよ!
			var c=this.getContent();
			empty(c);
			c.appendChild(el("h1",(h1)=>{
				h1.textContent=(d.getMonth()+1)+"月"+d.getDate()+"日の服装";
			}));
			//服グループごとに
			var groups=scheduler.doc.groups;
			//まず服の情報を全部とる
			var clothdocs:ClothDoc[]=[];
			var getCloth;
			(getCloth=(index:number)=>{
				db.getCloth(cloth[index],(cdoc:ClothDoc)=>{
					if(cdoc){
						clothdocs[index]=cdoc;
						if(index<cloth.length-1){
							getCloth(index+1);
							return;
						}
					}
					//もう終わり
					//とりあえずボタンつくっておく
					var button=<HTMLButtonElement>el("button",(button)=>{
						button.textContent=(d.getMonth()+1)+"月"+d.getDate()+"日の服を登録";
					});
					groups.forEach((x:number)=>{
						c.appendChild(el("section",(section)=>{
							db.getClothGroup(x,(cgdoc:ClothGroupDoc)=>{
								section.appendChild(el("h1",(h1)=>{
									h1.appendChild(icons.clothgroup({
										width:"32px",
										height:"32px",
									}));
									h1.appendChild(document.createTextNode(cgdoc.name));
								}));
								//服
								for(var i=0,l=clothdocs.length;i<l;i++){
									if(cloth[i]!=null && clothdocs[i].group.indexOf(cgdoc.id)>=0){
										//これに当てはまる
										section.appendChild(el("div",(div)=>{
											div.appendChild(Cloth.importCloth(clothdocs[i]).getSVG("48px","48px"));
										}));
										cloth[i]=null;	//消費済み
										break;
									}
								}
								if(i===l){
									//該当なしだった
									section.appendChild(el("p",(p)=>{
										p.textContent="服が未選択です。";
									}));
									section.appendChild(el("ul",(div)=>{
										//服一覧
										div.classList.add("choosecloth-field");
										db.eachCloth({
											group:cgdoc.id
										},(cdoc)=>{
											if(cdoc){
												div.appendChild(el("li",(div)=>{
													div.dataset.cloth=String(cdoc.id);
													div.appendChild(Cloth.importCloth(cdoc).getSVG("32px","32px"));
												}));
											}
										});
										//クリックで選択できる
										div.addEventListener("click",(e)=>{
											var node:HTMLElement=<HTMLElement>e.target;
											do{
												if(node.dataset && node.dataset.cloth){
													//服を選択した
													var newcloth=original_cloth.concat([Number(node.dataset.cloth)]);
													newcloth.sort();
													//これでどうだ!
													this.open(d,newcloth);
													break;
												}
											}while(node=<HTMLElement>node.parentNode);
										},false);
									}));
									//まだだめだよ!
									button.disabled=true;
								}
							});
						}));
					});
					//登録ボタン
					c.appendChild(el("p",(p)=>{
						p.appendChild(button);
						button.addEventListener("click",(e)=>{
							//服を登録する
							//dbにaddLogを追加するところから!
							var newlog:LogDoc={
								id:null,
								scheduler:scheduler.doc.id,
								cloth:original_cloth,
								date:d,
							};
							delete newlog.id;
							db.addupLog(newlog,(result:number)=>{
								//成功を伝える
								this.close("scheduler::open:"+newlog.scheduler);
							});
						},false);
					}));
				});
			})(0);
			help((helpel)=>{
				helpel.appendChild(el("h1",(h1)=>{
					h1.textContent="服の選択";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="着る服を確認したら登録ボタンを押して下さい。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="3つ以上服グループがある場合は、この画面でさらに選択します。";
				}));
			});
		}
	}
	//ログ
	export class DayLog extends UISection{
		constructor(private db:DB,private scheduler:Scheduler){
			super();
		}
		open(d:Date):void{
			var db=this.db, scheduler=this.scheduler, doc=scheduler.doc;
			var c=this.getContent();
			d=zeroDate(d);
			empty(c);
			c.appendChild(el("h1",(h1)=>{
				h1.textContent=(d.getMonth()+1)+"月"+d.getDate()+"日のログ";
			}));
			//まず服を全部取得するか!
			db.getClothGroups(doc.groups,(cgdocs:ClothGroupDoc[])=>{
				//次にログを取得するか!
				db.eachLog({
					scheduler:doc.id,
					date:{
						start:d,
						end:d,
					},
				},(ldoc:LogDoc)=>{
					//1つしかこないよね・・・
					if(ldoc==null)return;
					var cloth=ldoc.cloth.concat([]);
					//次に服を全部取得するか!
					db.getClothes(cloth,(cdocs:ClothDoc[])=>{
						c.appendChild(el("div",(div)=>{
							//各clothgroupについて
							cgdocs.forEach((cgdoc)=>{
								//服を探す
								for(var i=0,l=cloth.length;i<l;i++){
									if(cloth[i]!=null && cdocs[i].group.indexOf(cgdoc.id)>=0){
										//所属だ!
										((cdoc:ClothDoc)=>{
											div.appendChild(el("div",(div)=>{
												div.classList.add("group-cloth-group");
												//服グループの情報
												div.appendChild(selectbox.clothgroup(cgdoc,{
													del:false,
												},(mode:string)=>{
													//開く
													this.close("clothgroup::id:"+cgdoc.id);
												}));
												div.appendChild(selectbox.cloth(cdoc,{
													size:"96px",
												},(mode:string)=>{
													this.close("cloth::"+cdoc.id);
												}));
											}));
										})(cdocs[i]);
										cloth[i]=null;
										break;
									}
								}
							});
						}));
					});
				});
			});

		}
	}
	//スケジューラコンテナ
	export class SchedulerContainer extends UIObject{
		private date:Date;
		constructor(public id:any,private db:DB){
			//id:スケジューラのID
			super();
		}
		//conf:オプション画面を開くかどうか
		open(conf:bool):void{
			UI.Scheduler.getScheduler(this.db,this.id,(result:Scheduler)=>{
				var c=this.getContent();
				c.classList.add("scheduler-container");
				while(c.firstChild)c.removeChild(c.firstChild);
				if(result){
					//hard!
					this.id=result.doc.id;	//id保存
					//現在のスケジューラとして保存
					localStorage.setItem("lastScheduler",String(this.id));
					result.setDate(new Date);
					c.appendChild(result.getContent());
					result.onclose((returnValue:any)=>{

						/*if(returnValue==="reload"){
							//読みなおしてほしい
							this.open(false);
						}else{
							//それ以外だったら道連れ終了
							this.close(returnValue);
						}*/
						this.close(returnValue);
					});
					//設定画面導入
					if(conf){
						var modal=new ModalUI(result);
						var setting=new SchedulerConfig(this.db,result);
						modal.slide("simple",setting,(returnValue:any)=>{
							//よみ直す
							this.close("scheduler::open:"+this.id);
						});
					}
				}else{
					c.appendChild(el("p",(p)=>{
						p.textContent="スケジューラがありません。";
					}));
				}
			});
		}
	}
	//スケジューラリスト
	export class SchedulerList extends UISection{
		constructor(private db:DB,option:{
		}){
			super();
			var c=this.getContent();
			this.open();
		}
		private open():void{
			var c=this.getContent();
			empty(c);
			c.appendChild(el("h1",(h1)=>{
				h1.textContent="全てのスケジューラ";
			}));
			c.classList.add("scheduler-list");
			var count:number=0;
			this.db.eachScheduler({},(doc:SchedulerDoc)=>{
				if(doc==null){
					//終了
					if(count===0){
						//一つもない
						c.appendChild(el("p",(p)=>{
							p.textContent="スケジューラはありません。";
						}));
					}
					//新しいスケジューラボタン
					c.appendChild(el("button",(button)=>{
						button.appendChild(icons.plus({
							color:"#666666",
							width:"24px",
							height:"24px",
						}));
						button.appendChild(document.createTextNode("新しいスケジューラを作成"));
						button.addEventListener("click",(e)=>{
							//新しいのを作っちゃう
							var nsc:SchedulerDoc={
								id:Infinity,
								type:"calender",
								name:"新しいスケジューラ",
								made:new Date,
								groups:[],
							};
							delete nsc.id;
							this.db.setScheduler(nsc,(id:number)=>{
								//これだ!
								nsc.id=id;
								this.close("scheduler::conf:"+id);
							});
						},false);
						count++;
					}));
					return;
				}
				c.appendChild(selectbox.scheduler(doc,{
					del:true,
				},(mode:string)=>{
					if(mode==="normal"){
						//開いて欲しいな
						this.close("scheduler::open:"+doc.id);
					}else if(mode==="delete"){
						//消しちゃいたいな
						var res=window.confirm("スケジューラを削除しますか?この操作は元に戻せません。\n\nスケジューラを削除しても、服や服グループのデータは削除されません。");
						if(res){
							this.db.cleanupScheduler(doc.id,(result:bool)=>{
								this.open();
							});
						}
					}
				}));
			});
			help();
		}
	}
	//独立系服グループリスト
	export class ClothGroupListContainer extends UIObject{
		constructor(private db:DB){
			super();
			var c=this.getContent();
			var optobj={
				add:true,
				selectadd:false,
				del:true,
			};
			var list=new ClothGroupList(db,optobj);
			c.appendChild(list.getContent());
			list.onclose((returnValue?:any)=>{
				if("string"===typeof returnValue){
					var result=returnValue.match(/^(\w+);(\d+)$/);
					if(result){
						//op
						switch(result[1]){
							case "select":	//ふつうに選択した
								this.close("clothgroup::id:"+result[2]);
								break;
							case "delete":	//消したい
								// 抹 消
								var res=window.confirm("服グループを削除しますか?\nこの動作は取り消せません。\n\n服グループを削除しても、所属する服は削除されません。");
								if(res){
									//消す
									db.cleanupClothGroup(Number(result[2]),(result:bool)=>{
										list.open(db,optobj);
									});
								}
								break;
							case "add":	//既存のを追加した
								//新しく!再利用
								list.open(db,optobj);
								break;
						}
						return;
					}
				}
				this.close(returnValue);
			});
		}
	}
	//服グループのリスト
	export class ClothGroupList extends UISection{
		constructor(private db:DB,option?:{
			schedulerid?:number;
			add?:bool;	//新規追加ボタンあるか
			selectadd?:bool;
			del?:bool;	//削除ボタンあるか
		}){
			super();
			if(!option){
				option={};
			}
			this.open(db,option);
		}
		open(db:DB,option:{
				schedulerid?:number;
				add?:bool;	//新規追加ボタンあるか
				selectadd?:bool;	//既存から選んで追加ボタンがあるか
				del?:bool;
		}):void{
			var _self=this;
			var c=this.getContent();
			c.classList.add("clothgroup-list");
			empty(c);
			var count:number=0;	//表示済みのやつを数える
			if(option.schedulerid!=null){
				db.getScheduler(option.schedulerid,(schedulerdoc:SchedulerDoc)=>{
					if(schedulerdoc==null){
						//あれれーーーーーーー
						c.appendChild(el("p",(p)=>{
							p.textContent="エラー:そのスケジューラの情報は取得できません。"
						}));
						return;
					}
					//タイトル
					c.appendChild(el("h1",(h1)=>{
						h1.textContent=schedulerdoc.name+"に属する服グループ";
					}));
					schedulerdoc.groups.forEach((id:number,i:number)=>{
						db.getClothGroup(id,(result:ClothGroupDoc)=>{
							if(result)addlist(result);
							if(i+1===schedulerdoc.groups.length){
								//これで最後だ
								addlist(null);
							}
						});
					});
					if(!schedulerdoc.groups.length){
						//ひとつもない
						addlist(null);
					}
				});
			}else{
				//タイトル
				c.appendChild(el("h1",(h1)=>{
					h1.textContent="全ての服グループ";
				}));
				//全部列挙だー
				db.eachClothGroup(null,addlist);
			}

			function addlist(doc:ClothGroupDoc):void{
				if(doc){
					count++;
					//ある!つくる
					c.appendChild(selectbox.clothgroup(doc,{
						del:!!option.del,
					},(mode:string)=>{
						//えらんだ!
						if(mode==="normal"){
							_self.close("select;"+doc.id);
						}else if(mode==="delete"){
							_self.close("delete;"+doc.id);
						}
					}));
				}else{
					//終了だ!
					fin();
				}
			}
			function fin():void{
				//全部終了の処理
				if(count===0){
					//ひとつもないじゃないか・・・
					c.appendChild(el("p",(p)=>{
						p.textContent="服グループはまだありません。";
					}));
				}
				//追加ボタン
				if(option.selectadd){
					c.appendChild(el("p",(p)=>{
						p.appendChild(el("button",(b)=>{
							var button=<HTMLButtonElement>b;
							button.appendChild(icons.plus({
								color:"#666666",
								width:"24px",
								height:"24px",
							}));
							button.appendChild(document.createTextNode("既存の服グループを追加"));
							button.addEventListener("click",(e)=>{
								//新しいやつを追加したいなあ・・・
								var modal=new ModalUI(_self);
								var list2=new ClothGroupList(db,{
									add:false,
									del:false,
								});
								modal.slide("simple",list2,(returnValue?:any)=>{
									if("string"===typeof returnValue){
										var result=returnValue.match(/^(\w+);(\d+)$/);
										if(result && result[1]==="select"){
											//選択した
											_self.close("add;"+result[2]);
											return;
										}
									}
									if(returnValue){
										_self.close(returnValue);
									}
								});
							},false);
						}));
					}));
				}
				if(option.add){
					c.appendChild(el("p",(p)=>{
						p.appendChild(el("button",(b)=>{
							var button=<HTMLButtonElement>b;
							button.appendChild(icons.plus({
								color:"#666666",
								width:"24px",
								height:"24px",
							}));
							button.appendChild(document.createTextNode("新しい服グループを作成して追加"));
							button.addEventListener("click",(e)=>{
								//新しいやつを追加したいなあ・・・
								var modal=new ModalUI(_self);
								var info=new NewClothGroup(db,option.schedulerid);
								modal.slide("simple",info,(returnValue?:any)=>{
									if(returnValue!=null){
										//伝えたいことがあるんだ
										if("number"===typeof returnValue){
											//新しい服グループのidがきた!
											//_self.open(db,option);
											_self.close("add;"+returnValue);
										}else{
											_self.close(returnValue);
										}
									}
								});
							},false);
						}));
					}));
				}
			}
		}
	}
	export class ClothGroupInfo extends UISection{
		constructor(private db:DB,public clothgroupid:number,schedulerid?:number){
			super();
			this.open(schedulerid);
		}
		private open(schedulerid?:number):void{
			var _self=this;
			//schedulerid: 新規登録（スケジューラへ）
			var db=this.db, clothgroupid=this.clothgroupid;
			var c=this.getContent();
			c.classList.add("clothgroup-info");
			//けす
			empty(c);
			var doc:ClothGroupDoc=null;
			//まず情報を取得
			if(clothgroupid!=null){
				db.getClothGroup(clothgroupid,(doc:ClothGroupDoc)=>{
					if(doc==null){
						//あれれーーーーーー
						c.appendChild(el("p",(p)=>{
							p.textContent="この服グループの情報は取得できません。";
						}));
					}else{
						useInfo(doc);
					}
				});
			}else{
				//新規じゃないかこれは?
				doc={
					id:-Infinity,	//暫定
					name:"新しい服グループ",
					made:new Date,
				};
				useInfo(doc);
			}

			help((helpel)=>{
				helpel.appendChild(el("h1",(h1)=>{
					h1.textContent="服グループの設定";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="服グループの設定では、名前の変更や所属するスケジューラの確認・服の登録ができます。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="服グループを作ったばかりの場合は、まず服を登録しましょう。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="服グループを削除する場合は、上部メニューの服グループの一覧から削除して下さい。";
				}));
			});

			//ClothGroupDocに近いもの・・・idがないかも
			function useInfo(doc:ClothGroupDoc):void{
				c.appendChild(el("h1",(h1)=>{
					h1.appendChild(icons.clothgroup({
						width:"32px",
						height:"32px",
					}));
					h1.appendChild(document.createTextNode(doc.name));
				}));
					//設定
				c.appendChild(el("section",(section)=>{
					section.appendChild(el("h1",(h1)=>{
						h1.appendChild(icons.gear({
							width:"28px",
							height:"28px",
							anime:"always",
						}));
						h1.appendChild(document.createTextNode("設定"));
					}));
					section.appendChild(el("form",(f)=>{
						var form=<HTMLFormElement>f;
						form.appendChild(el("p",(p)=>{
							p.textContent="名前:";
							p.appendChild(el("input",(i)=>{
								var input=<HTMLInputElement>i;
								input.name="name";
								input.size=30;
								input.placeholder="名前";
								input.value=doc.name;
							}));
						}));
						form.appendChild(el("p",(p)=>{
							p.appendChild(el("input",(i)=>{
								var input=<HTMLInputElement>i;
								input.type="submit";
								input.value="決定";
							}));
						}));
						form.addEventListener("submit",(e)=>{
							e.preventDefault();
							var name=(<HTMLInputElement>form.elements["name"]).value;
							//情報更新したいなあ
							if(clothgroupid==null){
								delete doc.id;	//idは向こうでつけてもらう
							}
							doc.name=name;
							db.setClothGroup(doc,(id:number)=>{
								if(id!=null){
									//idをゲットした!
									doc.id=id;
									_self.clothgroupid=id;
									if(schedulerid!=null){
										//新規で登録したい
										db.getScheduler(schedulerid,(schedulerdoc:SchedulerDoc)=>{
											if(schedulerdoc){
												if(schedulerdoc.groups.indexOf(id)<0){
													schedulerdoc.groups.push(id);
													db.setScheduler(schedulerdoc,(result:number)=>{
														//設定した
														_self.open();
													});
												}
											}
										});
									}else{
										_self.open();
									}
								}
							});
						},false);
					}));
				}));
				//所属するスケジューラの情報
				c.appendChild(el("section",(section)=>{
					if(schedulerid!=null){
						//新規だ!まだ
						section.hidden=true;
					}
					section.appendChild(el("h1",(h1)=>{
						h1.textContent="所属スケジューラ";
					}));
					var count=0;
					db.eachScheduler({
						group:doc.id,
					},(sdoc:SchedulerDoc)=>{
						if(sdoc==null){
							//もうない
							if(count===0){
								section.appendChild(el("p",(p)=>{
									p.textContent="所属スケジューラはありません。";
								}));
							}
							return;
						}
						section.appendChild(selectbox.scheduler(sdoc,{
							del:true,
						},(mode:string)=>{
							if(mode==="normal"){
								//スケジューラを開く
								_self.close("scheduler::open:"+sdoc.id);
							}else if(mode==="delete"){
								//除去
								sdoc.groups=sdoc.groups.filter((x)=>{
									return x!==doc.id;
								});
								db.setScheduler(sdoc,(result:number)=>{
									_self.open();
								});
							}
						}));
						count++;
					});
				}));
				//服の一覧
				c.appendChild(el("section",(section)=>{
					if(schedulerid!=null){
						section.hidden=true;
					}
					section.appendChild(el("h1",(h1)=>{
						h1.textContent="服の一覧";
					}));
					var count=0;
					db.eachCloth({
						group:doc.id,
					},(cdoc:ClothDoc)=>{
						if(cdoc==null){
							//もうない
							if(count===0){
								section.appendChild(el("p",(p)=>{
									p.textContent="服は登録されていません。";
								}));
							}
							//追加ボタン
							section.appendChild(el("p",(p)=>{
								p.appendChild(el("button",(b)=>{
									var button=<HTMLButtonElement>b;
									button.appendChild(icons.plus({
										color:"#666666",
										width:"24px",
										height:"24px",
									}));
									button.appendChild(document.createTextNode("新しい服を作成して登録"));
									button.addEventListener("click",(e)=>{
										//新しいやつを追加したいなあ・・・
										//服のデザイン選択UI
										var modal=new ModalUI(_self);
										var sel=new ClothSelect(null);
										modal.slide("simple",sel,(returnValue?:any)=>{
											if(returnValue!=null){
												if(returnValue.mode==="save"){
													//保存
													var clothd:ClothDoc={
														id:null,
														name:"",
														type:returnValue.doc.type,
														patterns:returnValue.doc.patterns,
														group:[doc.id],
														used:0,
														status:"active",
														made:new Date(),
														lastuse:null,
													};
													delete clothd.id;
													db.setCloth(clothd,(result:number)=>{
														//DBに服のデータを保存
														if(result!=null){
															clothd.id=result;
															//詳細設定画面へ
															_self.close("cloth::"+result);
														}
													});
													return;
												}
												_self.close(returnValue);
											}
										});
									},false);
								}));
							}));
							return;
						}
						section.appendChild(selectbox.cloth(cdoc,null,(mode:string)=>{
							//スケジューラを開く
							_self.close("cloth::"+cdoc.id);
						}));
						count++;
					});
				}));
			}
		}
	}
	//新しい服グループのやつ
	export class NewClothGroup extends UISection{
		constructor(private db:DB,schedulerid?:number){
			super();
			var c=this.getContent();
			c.appendChild(el("h1",(h1)=>{
				h1.appendChild(icons.clothgroup({
					width:"32px",
					height:"32px",
				}));
				h1.appendChild(document.createTextNode("新しい服グループを作成する"));
			}));
			c.appendChild(el("form",(f)=>{
				var form=<HTMLFormElement>f;
				form.appendChild(el("p",(p)=>{
					p.textContent="名前:";
					p.appendChild(el("input",(i)=>{
						var input=<HTMLInputElement>i;
						input.name="name";
						input.size=30;
						input.placeholder="名前を入力";
						input.value="新しい服グループ";
					}));
				}));
				form.appendChild(el("p",(p)=>{
					p.appendChild(el("input",(i)=>{
						var input=<HTMLInputElement>i;
						input.type="submit";
						input.value="決定";
					}));
				}));
				form.addEventListener("submit",(e)=>{
					e.preventDefault();
					var name=(<HTMLInputElement>form.elements["name"]).value;
					var doc:ClothGroupDoc={
						id:null,
						name:name,
						made:new Date(),
					};
					delete doc.id;
					db.setClothGroup(doc,(id:number)=>{
						if(id!=null){
							//idをゲットした!
							doc.id=id;
							if(schedulerid!=null){
								//新規で登録したい
								db.getScheduler(schedulerid,(schedulerdoc:SchedulerDoc)=>{
									if(schedulerdoc){
										if(schedulerdoc.groups.indexOf(id)<0){
											schedulerdoc.groups.push(id);
											db.setScheduler(schedulerdoc,(result:number)=>{
												//設定した
												this.close(id);
											});
										}
									}
								});
							}else{
								this.close(id);
							}
						}else{
							this.close(null);
						}
					});
				},false);
			}));
		}
	}
	//服のデザイン選択UI
	export class ClothSelect extends UISection{
		private previewArea:HTMLElement;
		private mainArea:HTMLElement;
		private cloth:Cloth;	//現在編集中のやつ
		private editingIndex:number;	//現在編集中のパターン番号
		constructor(private doc:{
			type:string;
			patterns:PatternObj[];
		}){
			super();
			var c=this.getContent();
			c.appendChild(el("h1",(h1)=>{
				h1.textContent="服エディタ";
			}));
			c.appendChild(el("div",(div)=>{
				div.classList.add("clothselect-container");
				div.appendChild(el("div",(div)=>{
					div.classList.add("clothselect-typeselect");
					//服を入れていく
					Cloth.clothTypes.forEach((obj)=>{
						var sample=Cloth.importCloth({
							type:obj.type,
							patterns:[],
						});
						div.appendChild(el("div",(div)=>{
							div.classList.add("clothselect-typebox");
							div.dataset.type=obj.type;
							div.appendChild(sample.getSVG("48px","48px"));
						}));
					});
					div.addEventListener("click",(e)=>{
						var t=e.target;
						var node:Node=<any>t;
						var patternIndex:number=null;
						do{
							var el=<HTMLElement>node;
							if(el.classList && el.classList.contains("clothselect-typebox")){
								//これだ!
								this.doc.type=el.dataset.type;
								this.setType();
								break;
							}
						}while(node=node.parentNode);
					},false);
				}));
				div.appendChild(el("div",(div)=>{
					this.previewArea=div;
					div.classList.add("clothselect-previewbox");
					div.addEventListener("click",(e)=>{
						//服を選択するんだ・・・
						var t=e.target;
						var node:Node=<any>t;
						var patternIndex:number=null;
						do{
							var el=<Element>node;
							var fi=el.getAttribute("fill");
							if(fi){
								var result=fi.match(/^url\(#cloth(\d+)-pattern(\d+)\)$/);
								if(result){
									patternIndex=parseInt(result[2]);
									break;
								}
							}
						}while(node=node.parentNode);
						if(patternIndex!=null){
							//パターン発見!これをいじる
							this.editPattern(patternIndex);
						}
					},false);
				}));
				div.appendChild(el("div",(div)=>{
					//服ごとのやつ
					this.mainArea=div;
					//初期値
					div.textContent="服をクリック/タップして服の模様を編集して下さい。";
				}));
				div.appendChild(el("div",(div)=>{
					div.classList.add("clothselect-patternselect");
					//最初から全部列挙
					Cloth.patternTypes.forEach((obj,i)=>{
						div.appendChild(el("div",(div)=>{
							div.classList.add("clothselect-patternbox");
							div.dataset.type=obj.type;
							div.appendChild(svg("svg",(v)=>{
								var vg=<SVGSVGElement>v;
								vg.setAttribute("version","1.1");
								vg.width.baseVal.valueAsString="48px";
								vg.height.baseVal.valueAsString="48px";
								vg.viewBox.baseVal.x=0, vg.viewBox.baseVal.y=0, vg.viewBox.baseVal.width=96, vg.viewBox.baseVal.height=96;
								var patt=<SVGPatternElement>Cloth.makePattern({
									type:obj.type,
									size:obj.defaultSize,
									colors:Cloth.defaultColors.slice(0,obj.colorNumber),
								});
								patt.id="patternbox"+i+"-pattern";
								vg.appendChild(patt);
								vg.appendChild(svg("rect",(r)=>{
									var rect=<SVGRectElement>r;
									rect.setAttribute("stroke","#000000");
									rect.setAttribute("stroke-width","2px");
									rect.x.baseVal.valueAsString="0px";
									rect.y.baseVal.valueAsString="0px";
									rect.width.baseVal.valueAsString="96";
									rect.height.baseVal.valueAsString="96";
									rect.setAttribute("fill","url(#patternbox"+i+"-pattern)");
								}));
							}));
						}));
					});
					div.addEventListener("click",(e)=>{
						var node:HTMLElement=<HTMLElement>e.target;
						do{
							if(node.classList && node.classList.contains("clothselect-patternbox")){
								var patype:string=node.dataset.type;
								var pato=Cloth.patternTypes.filter((x)=>{
									return x.type===patype;
								})[0];
								var pat=this.doc.patterns[this.editingIndex];
								pat.type=patype;
								//pat.colors=pat.colors.slice(0,pato.colorNumber);
								//色足りない
								while(pat.colors.length<pato.colorNumber){
									pat.colors[pat.colors.length]=Cloth.defaultColors[pat.colors.length];
								}
								//サイズ調整
								pat.size=pato.defaultSize;
								//できたらOK!
								this.changePattern(this.editingIndex,pat);
								this.editPattern(this.editingIndex);
							}
						}while(node=<HTMLElement>node.parentNode);
					},false);
				}));
			}));
			//登録ボタン
			c.appendChild(el("p",(p)=>{
				p.appendChild(el("button",(b)=>{
					var button=<HTMLButtonElement>b;
					button.textContent="服を保存";
					button.addEventListener("click",(e)=>{
						this.close({
							mode:"save",
							doc:this.doc,
						});
					},false);
				}));
				p.appendChild(el("button",(b)=>{
					var button=<HTMLButtonElement>b;
					button.textContent="キャンセル";
					button.addEventListener("click",(e)=>{
						this.close({
							mode:"cancel",
						});
					},false);
				}));
			}));
			//docがない!?
			if(!doc){
				doc=this.doc={
					type:"UT-shirt",
					patterns:[],
				};
			}
			this.setType();

			help((helpel)=>{
				helpel.appendChild(el("h1",(h1)=>{
					h1.textContent="服エディタ";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="服エディタでは服のデザインを決めることができます。実際の服に近いデザインにするとわかりやすくなります。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="一番左のメニューから服の種類を決めましょう。決めたら右に大きな服の画像が出現します。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="色や模様を変えたいときは、服のその部分をクリックします。右に色選択画面が出現するので、色を変更しましょう。その右には模様選択があります。模様をクリックするとその模様になります。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="編集が終わったら服を保存ボタンを押します。";
				}));
			});
		}
		private setType():void{
			empty(this.previewArea);
			this.cloth=Cloth.importCloth(this.doc);
			var pats=this.doc.patterns;
			//数たりてるかチェック
			var tytyty=Cloth.clothTypes.filter((x)=>x.type===this.doc.type)[0];
			while(pats.length<tytyty.patternNumber){
				pats[pats.length]={
					type:"simple",
					size:0,
					deg:0,
					colors:[Cloth.defaultColors[pats.length]],
				};
			}
			this.previewArea.appendChild(this.cloth.getSVG("128px","128px"));
			this.editPattern(0);
		}
		private changePattern(index:number,pat:PatternObj):void{
			if(!this.cloth)return;
			//パターンだけ変わった
			var vg=<SVGSVGElement>this.previewArea.getElementsByTagNameNS(Cloth.svgNS,"svg")[0];
			Cloth.changePattern(index,pat,vg);
			//プレビューも変える
			vg=<SVGSVGElement>this.mainArea.getElementsByTagNameNS(Cloth.svgNS,"svg")[0];
			var patt=<SVGPatternElement>vg.getElementById("preview-pattern");
			var newpatt=Cloth.makePattern(pat);
			newpatt.id="preview-pattern";
			patt.parentNode.replaceChild(newpatt,patt);
		}
		private editPattern(index:number):void{
			//このパターンをeditする
			this.editingIndex=index;
			var main=this.mainArea;
			empty(main);
			var pat=this.doc.patterns[index];
			//足りない色があれば補う
			var tytyty=Cloth.patternTypes.filter((x)=>x.type===pat.type)[0];
			while(pat.colors.length<tytyty.colorNumber){
				pat.colors[pat.colors.length]=Cloth.defaultColors[pat.colors.length];
			}
			var preview=svg("svg",(v)=>{
				var vg=<SVGSVGElement>v;
				vg.setAttribute("version","1.1");
				vg.width.baseVal.valueAsString="96px";
				vg.height.baseVal.valueAsString="96px";
				vg.viewBox.baseVal.x=0, vg.viewBox.baseVal.y=0, vg.viewBox.baseVal.width=256, vg.viewBox.baseVal.height=256;
				//パターン
				var pattern=Cloth.makePattern(pat);
				pattern.id="preview-pattern";
				vg.appendChild(pattern);
				vg.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					rect.setAttribute("stroke","#000000");
					rect.setAttribute("stroke-width","2px");
					rect.x.baseVal.valueAsString="0px";
					rect.y.baseVal.valueAsString="0px";
					rect.width.baseVal.valueAsString="256px";
					rect.height.baseVal.valueAsString="256px";
					rect.setAttribute("fill","url(#preview-pattern)");
				}));
			});
			main.appendChild(el("div",(div)=>{
				div.appendChild(preview);
			}));
			if(tytyty.requiresSize){
				//サイズ必要
				main.appendChild(el("div",(div)=>{
					div.textContent="サイズ:";
					div.appendChild(el("input",(i)=>{
						var input=<HTMLInputElement>i;
						input.type="range";
						input.min="1";
						input.max="128";
						input.step="1";
						input.value=String(pat.size);
					((input)=>{
						input.addEventListener("change",(e)=>{
							//変更された
							pat.size=Number(input.value);
							//変更反映
							this.changePattern(index,pat);
						},false);
					})(input);
					}));
				}));
			}
			if(tytyty.requiresDeg){
				//角度必要
				main.appendChild(el("div",(div)=>{
					div.textContent="角度:";
					div.appendChild(el("input",(i)=>{
						var input=<HTMLInputElement>i;
						input.type="range";
						input.min="0";
						input.max="180";
						input.step="1";
						input.value=String(pat.deg || 0);
					((input)=>{
						input.addEventListener("change",(e)=>{
							//変更された
							pat.deg=Number(input.value);
							input.title=input.value+"°";
							//変更反映
							this.changePattern(index,pat);
						},false);
					})(input);
					}));
				}));
			}
			//各色を設定する
			for(var i=0;i<tytyty.colorNumber;i++){
				main.appendChild(el("div",(div)=>{
					//色プレビュー
					var input;
					div.textContent="色"+(i+1)+":";
					//変更フォーム
					div.appendChild(input=<HTMLInputElement>el("input",(inp)=>{
						var input=<HTMLInputElement>inp;
						input.type="color";
						input.value=pat.colors[i];
					}));
					//change!
					((i,input)=>{
						input.addEventListener("input",(e)=>{
							//色変更された
							pat.colors[i]=input.value;
							//変更反映
							this.changePattern(index,pat);
						},false);
					})(i,input);
				}));
			}
		}
	}
	//服の情報UI
	export class ClothInfo extends UISection{
		constructor(private db:DB,public clothid:number){
			super();
			this.open();
		}
		private open():void{
			var db=this.db, clothid=this.clothid;
			var c=this.getContent();
			c.classList.add("cloth-info");
			empty(c);
			//情報取得
			db.getCloth(clothid,(doc:ClothDoc)=>{
				if(doc==null){
					//あれれーーーーーーー
					c.appendChild(el("p",(p)=>{
						p.textContent="この服の情報は取得できません。";
					}));
					return;
				}
				//情報をもとに構築
				c.appendChild(el("h1",(h1)=>{
					h1.appendChild(Cloth.importCloth({
						type:doc.type,
						patterns:doc.patterns,
					}).getSVG("128px","128px"));
					h1.appendChild(document.createTextNode(doc.name ? doc.name+"の設定" : "設定"));
				}));
				c.appendChild(el("p",(p)=>{
					p.appendChild(el("button",(b)=>{
						b.textContent="デザインを変更する";
						b.addEventListener("click",(e)=>{
							//デザイン変更するぜ!
							var modal=new ModalUI(this);
							var sel=new ClothSelect({
								type:doc.type,
								patterns:doc.patterns,
							});
							modal.slide("simple",sel,(returnValue?:any)=>{
								if(returnValue!=null){
									if(returnValue.mode==="save"){
										//保存
										doc.type=returnValue.doc.type;
										doc.patterns=returnValue.doc.patterns;
										this.saveDoc(doc);
									}
								}
							});
						},false);
					}));
				}));
				c.appendChild(el("form",(f)=>{
					var form=<HTMLFormElement>f;
					form.appendChild(el("p",(p)=>{
						p.textContent="服の名前（省略可能）:";
						p.appendChild(el("input",(i)=>{
							var input=<HTMLInputElement>i;
							input.size=20;
							input.name="name";
							input.placeholder="名前";
							input.value=doc.name || "";
						}));
						p.appendChild(el("input",(i)=>{
							var input=<HTMLInputElement>i;
							input.type="submit";
							input.value="保存";
						}));
						form.addEventListener("submit",(e)=>{
							e.preventDefault();
							//保存
							doc.name=(<HTMLInputElement>form.elements["name"]).value;
							this.saveDoc(doc);
						});
					}));
				}));
				c.appendChild(el("section",(section)=>{
					section.appendChild(el("h1",(h1)=>{
						h1.textContent="情報";
					}));
					if(doc.status==="washer"){
						section.appendChild(el("p",(p)=>{
							p.textContent="洗濯機に入っています";
						}));
						section.appendChild(el("p",(p)=>{
							p.appendChild(el("button",(button)=>{
								button.appendChild(icons.washer({
									width:"28px",
									height:"28px",
								}));
								button.appendChild(document.createTextNode("洗濯機から出す"));
								button.addEventListener("click",(e)=>{
									//おせんたくするぞ!
									doc.status="active";
									db.setCloth(doc,(result:number)=>{
										this.open();
									});
								},false);
							}));
						}));
					}else{
						section.appendChild(el("p",(p)=>{
							if(doc.used>0){
								p.textContent="洗濯後"+doc.used+"回使用";
							}else{
								p.textContent="洗濯後未使用";
							}
						}));
						//洗濯機に入れるかどうか
						section.appendChild(el("p",(p)=>{
							p.appendChild(el("button",(button)=>{
								button.appendChild(icons.washer({
									width:"28px",
									height:"28px",
								}));
								button.appendChild(document.createTextNode("洗濯機に入れる"));
								button.addEventListener("click",(e)=>{
									//おせんたくするぞ!
									doc.status="washer";
									db.setCloth(doc,(result:number)=>{
										this.open();
									});
								},false);
							}));
						}));
					}
					if(doc.lastuse){
						section.appendChild(el("p",(p)=>{
							p.textContent="最後に使用した日付:"+doc.lastuse.getFullYear()+"年"+(doc.lastuse.getMonth()+1)+"月"+doc.lastuse.getDate()+"日";
						}));
					}
				}));
				c.appendChild(el("section",(section)=>{
					section.appendChild(el("h1",(h1)=>{
						h1.textContent="所属する服グループの一覧";
					}));
					section.appendChild(el("div",(div)=>{
						var _self=this, count=0;
						getone(0);
						function getone(index:number):void{
							var nextid=doc.group[index];
							if(nextid==null){
								//もうおわり
								if(count===0){
									//ひとつもない
									div.appendChild(el("p",(p)=>{
										p.textContent="所属する服グループはありません。";
									}));
								}
								return;
							}
							//あった!
							db.getClothGroup(nextid,(cgdoc:ClothGroupDoc)=>{
								if(cgdoc){
									//あった!
									div.appendChild(selectbox.clothgroup(cgdoc,{
										del:true,
									},(mode:string)=>{
										if(mode==="normal"){
											var modal=new ModalUI(_self);
											var info=new ClothGroupInfo(db,cgdoc.id);
											modal.slide("simple",info,(mode?:string)=>{
												if(mode!=null){
													_self.close(mode);
												}
											});
										}else if(mode==="delete"){
											//この服グループは除外する
											doc.group=doc.group.filter((x)=>{
												return x!==cgdoc.id;
											});
											_self.saveDoc(doc);
										}
									}));
									count++;
								}
								getone(index+1);
							});
						}
					}));
					//追加ボタン
					section.appendChild(el("p",(p)=>{
						p.appendChild(el("button",(b)=>{
							var button=<HTMLButtonElement>b;
							button.appendChild(icons.plus({
								color:"#666666",
								width:"24px",
								height:"24px",
							}));
							button.appendChild(document.createTextNode("服グループを追加"));
							button.addEventListener("click",(e)=>{
								//新しいやつを追加したいなあ・・・
								var modal=new ModalUI(this);
								var list=new ClothGroupList(db,{
									del:false,
								});
								modal.slide("simple",list,(returnValue?:any)=>{
									if("string"===typeof returnValue){
										var result=returnValue.match(/^select;(\d+)$/);
										if(result){
											//服グループを選んだ
											var grid=Number(result[1]);
											if(doc.group.indexOf(grid)<0){
												//まだない
												doc.group.push(grid);
												this.saveDoc(doc);
											}
										}
									}
								});
							},false);
						}));
					}));
				}));
			});
			help((helpel)=>{
				helpel.appendChild(el("h1",(h1)=>{
					h1.textContent="服の設定";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="服の設定では、服のデザインを変えたり服を洗濯機に入れたりできます。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="洗濯機に入れた服は、上のメニューから洗濯機の画面を開くと洗うことができます。洗った服は使用回数が0回に戻ります。";
				}));
			});
		}
		private saveDoc(doc:ClothDoc,callback?:()=>void):void{
			this.db.setCloth(doc,(result:number)=>{
				if(callback){
					callback();
				}else{
					//デフォルト動作:かきなおす
					this.open();
				}
			});
		}
	}
	//洗濯機
	export class Washer extends UISection{
		constructor(private db:DB){
			super();
		}
		open():void{
			var db=this.db;
			var c=this.getContent();
			empty(c);
			c.appendChild(el("h1",(h1)=>{
				h1.appendChild(icons.washer({
					width:"48px",
					height:"48px",
				}));
				h1.appendChild(document.createTextNode("洗濯機"));
			}));
			c.appendChild(el("section",(section)=>{
				section.appendChild(el("h1",(h1)=>{
					h1.textContent="洗濯機の中にある服の一覧";
				}));
				var count:number=0;
				db.eachCloth({
					status:"washer",
				},(cdoc:ClothDoc)=>{
					if(cdoc==null){
						//もうない
						if(count===0){
							section.appendChild(el("p",(p)=>{
								p.textContent="服は入っていません。";
							}));
						}else{
							//洗う
							section.appendChild(el("p",(p)=>{
								p.appendChild(el("button",(button)=>{
									button.textContent="洗う";
									button.title="洗うと服の使用回数が0回に戻ります。";
									button.addEventListener("click",(e)=>{
										var count2:number=0;
										db.eachCloth({
											status:"washer",
										},(cdoc)=>{
											if(cdoc==null)return;
											cdoc.status="active";
											cdoc.used=0;
											db.setCloth(cdoc,(result:number)=>{
												count2++;
												if(count===count2){
													//全部
													this.open();
												}
											});
										});
									},false);
								}));
							}));
						}
						return;
					}
					section.appendChild(selectbox.cloth(cdoc,{
						size:"64px",
					},(mode:string)=>{
						this.close("cloth::"+cdoc.id);
					}));
					count++;
				});
			}));
			help((helpel)=>{
				helpel.appendChild(el("h1",(h1)=>{
					h1.textContent="洗濯機";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="洗濯機に入っている服は着ることができません。";
				}));
				helpel.appendChild(el("p",(p)=>{
					p.textContent="洗うと服の使用回数が0回に戻ります。使用回数が少ない服のほうがおすすめされやすくなります。";
				}));
			});
		}
	}
	export class Startup extends UISection{
		constructor(){
			super();
			var c=this.getContent();
			c.appendChild(el("h1",(h1)=>{
				h1.textContent="nanikiruへようこそ!";
			}));
			c.appendChild(el("p",(p)=>{
				p.textContent="nanikiruは服装管理アプリケーションです。服を登録して毎日の服を記録管理でき、今日のおすすめの服も教えてくれます。";
			}));
			c.appendChild(el("section",(section)=>{
				section.appendChild(el("h1",(h1)=>{
					h1.textContent="自己アピール（人となり）";
				}));
				section.appendChild(el("p",(p)=>{
					p.innerHTML="nanikiruを使って<strong>少ないリソース（服）を有効利用</strong>できる人です。今日はどの服を着るか迷う必要もなく<strong>時間も節約</strong>できる人です。";
				}));
				section.appendChild(el("p",(p)=>{
					p.innerHTML="またnanikiruには<strong>他人と服を共有する機能はありません</strong>。これは<strong>他人に流されず自分の意見をしっかり持つ人</strong>ということを表しているのです。";
				}));
			}));
			c.appendChild(el("section",(section)=>{
				section.appendChild(el("h1",(h1)=>{
					h1.textContent="自己アピール（スキル）";
				}));
				section.appendChild(el("p",(p)=>{
					p.innerHTML="画像を一切使わずに、多様な服アイコンを作成可能。服アイコンは<b>SVG</b>で表しています。データは<b>IndexedDB</b>で保存。";
				}));
			}));
			c.appendChild(el("section",(section)=>{
				section.appendChild(el("h1",(h1)=>{
					h1.textContent="動作環境";
				}));
				section.appendChild(el("p",(p)=>{
					p.innerHTML="nanikiruは、<strong>モダンブラウザ</strong>なら動きます。モダンブラウザとは、ここではHTML5をはじめとする各種技術に十分対応したブラウザとします。スマートフォン・タブレットでも、モダンブラウザ搭載なら動きます。";
				}));
			}));
			c.appendChild(el("p",(p)=>{
				p.appendChild(el("button",(button)=>{
					button.textContent="nanikiruを利用開始する";
					button.addEventListener("click",(e)=>{
						localStorage.setItem("startup","done");
						this.close("scheduler::open:");
					},false);
				}));
			}));
		}
	}
	export class Config extends UISection{
		constructor(private db:DB){
			super();
		}
		open():void{
			var db=this.db;
			var c=this.getContent();
			empty(c);
			c.appendChild(el("h1",(h1)=>{
				h1.textContent="設定";
			}));
			if(localStorage.getItem("nohelp")==="true"){
				c.appendChild(el("section",(section)=>{
					section.appendChild(el("h1",(h1)=>{
						h1.textContent="ヘルプの復活";
					}));
					section.appendChild(el("p",(p)=>{
						p.textContent="ヘルプを消してしまったが再び見たいという場合は復活ボタンを押して下さい。";
					}));
					section.appendChild(el("p",(p)=>{
						p.appendChild(el("button",(button)=>{
							button.textContent="復活";
							button.addEventListener("click",(e)=>{
								localStorage.removeItem("nohelp");
								this.open();
							},false);
						}));
					}));
				}));
			}
			c.appendChild(el("section",(section)=>{
				section.appendChild(el("h1",(h1)=>{
					h1.textContent="データインポート・エクスポート";
				}));
				section.appendChild(el("p",(p)=>{
					p.textContent="他のブラウザにデータを移したい場合は、データをJSONファイルにエクスポートすることが可能です。エクスポートしたデータはインポートすることで復活できます。";
				}));
				section.appendChild(el("p",(p)=>{
					p.textContent="インポーﾄ・エクスポートには時間がかかる可能性があります。インポートする場合はファイルを選択して下さい。";
				}));
				section.appendChild(el("p",(p)=>{
					p.appendChild(el("button",(button)=>{
						button.textContent="エクスポート";
						button.addEventListener("click",(e)=>{
							db.exportData((data:any)=>{
								if(data==null){
									//なんか失敗してんで
									return;
								}
								//JSONかするで
								var objstr=JSON.stringify(data);
								var a=el("a",(an)=>{
									var a=<HTMLAnchorElement>an;
									a.download="nanikiru.json";
									a.href="data:application/json;charset=UTF-8,"+encodeURIComponent(objstr);
								});
								a.click();
							});
						},false);
					}));
				}));
				section.appendChild(el("p",(p)=>{
					var file;
					p.appendChild(file=<HTMLInputElement>el("input",(i)=>{
						var input=<HTMLInputElement>i;
						input.type="file";
						input.required=true;
						input.accept=".json";
					}));
					p.appendChild(el("button",(button)=>{
						button.textContent="インポート";
						button.disabled=true;
						button.addEventListener("click",(e)=>{
							var f=file.files[0];
							if(!f)return;
							var reader=new FileReader();
							reader.onload=(e)=>{
								var obj=null;
								try{
									obj=JSON.parse(reader.result);
								}catch(e){
									alert("ファイルがパースできませんでした。ファイルが間違っているか、壊れている可能性があります。");
								}
								db.importData(obj,(result:bool)=>{
									if(result===false){
										alert("データをインポートできませんでした。ファイルが壊れている可能性があります。");
										return;
									}
									section.appendChild(el("p",(p)=>{
										p.textContent="データのインポートに成功しました。";
									}));
								});
							};
							reader.readAsText(f);
						},false);
						file.addEventListener("change",(e)=>{
							if(file.files[0]){
								//ファイルがある
								button.disabled=false;
							}else{
								button.disabled=true;
							}
						},false);
					}));
				}));
			}));
		}
	}
	//ダイアログ
	class Dialog extends UISection{
		constructor(private title:string,private message:string,private buttons:string[]){
			super();
			var c=this.getContent();
			c.classList.add("dialog-content");
			c.appendChild(el("h1",(h1)=>{
				h1.textContent=title;
			}));
			c.appendChild(el("p",(p)=>{
				p.textContent=message;
			}));
			//ボタン設置
			c.appendChild(el("p",(p)=>{
				buttons.forEach((label:string)=>{
					p.appendChild(el("button",(b)=>{
						var button=<HTMLButtonElement>b;
						button.textContent=Dialog.labelText[label];
						button.dataset.value=label;
					}));
				});
				p.addEventListener("click",(e)=>{
					var target=<HTMLElement><any>e.target;
					if(target.dataset.value){
						this.close(target.dataset.value);
					}
				},false);
			}));
		}
		//自分で全部やる
		show():void{
			var d=<HTMLDialogElement>document.createElement("dialog");
			d.appendChild(this.getContent());
			document.body.appendChild(d);
			d.showModal();
			this.onclose((returnValue?:string)=>{
				//valueはもっと下でうけとめる
				d.close();
				document.body.removeChild(d);
			});
		}
		static labelText:any={
			"ok":"OK",
			"yes":"はい",
			"no":"いいえ",
			"cancel":"キャンセル",
		}
	}
	//メニュー
	export class Menu extends UIObject{
		constructor(){
			super();
			var c=this.getContent();
			c.classList.add("menu");
			c.textContent="メニュー:";
			//各種ボタン
			c.appendChild(el("button",(button)=>{
				button.textContent="トップ";
				button.style.height="32px";
				button.addEventListener("click",(e)=>{
					this.close("scheduler::open:");
				},false);
			}));
			c.appendChild(el("button",(button)=>{
				button.classList.add("iconbutton");
				button.title="スケジューラの一覧";
				button.appendChild(icons.calender({
					width:"32px",
					height:"32px",
				}));
				button.addEventListener("click",(e)=>{
					this.close("schedulerlist::");
				},false);
			}));
			c.appendChild(el("button",(button)=>{
				button.classList.add("iconbutton");
				button.title="全ての服グループ";
				button.appendChild(icons.clothgroup({
					width:"32px",
					height:"32px",
				}));
				button.addEventListener("click",(e)=>{
					this.close("clothgroup::list:");
				},false);
			}));
			c.appendChild(el("button",(button)=>{
				button.classList.add("iconbutton");
				button.title="洗濯機";
				button.appendChild(icons.washer({
					width:"32px",
					height:"32px",
				}));
				button.addEventListener("click",(e)=>{
					this.close("washer::");
				},false);
			}));
			c.appendChild(el("button",(button)=>{
				button.classList.add("iconbutton");
				button.title="設定";
				button.appendChild(icons.gear({
					width:"32px",
					height:"32px",
				}));
				button.addEventListener("click",(e)=>{
					this.close("config::");
				},false);
			}));
		}
	}
	//割り込みUI
	class ModalUI{
		private container:HTMLElement;
		private returnValue:any=void 0;
		private helpdf:DocumentFragment=null;
		private dia:UIObject;
		constructor(private ui:UIObject){
			this.container=document.createElement("div");
			this.container.classList.add("modal-container");
			var c=ui.getContent();
			if(c.parentNode){
				//入れる
				c.parentNode.replaceChild(this.container,c);
				this.container.appendChild(c);
			}
			//ヘルプ救助
			var helpco=<HTMLElement>document.getElementsByClassName("helpco")[0];
			if(helpco.hasChildNodes()){
				var range:Range=document.createRange();
				range.selectNodeContents(helpco);
				this.helpdf=range.extractContents();
				range.detach();
			}
		}
		//画面割り込み発生!
		slide(mode:string,dia:UIObject,callback?:(returnValue:any)=>void):void{
			this.dia=dia;
			var tc=this.container, bc=this.ui.getContent(), nc=dia.getContent();
			var helpco=<HTMLElement>document.getElementsByClassName("helpco")[0];
			if(mode==="simple"){
				//ただの切り替え
				bc.style.display="none";
				tc.appendChild(nc);
				var p=el("p",(p)=>{
					p.appendChild(el("button",(button)=>{
						button.textContent="戻る";
						button.addEventListener("click",(e)=>{
							dia.close();
						},false);
					}));
				});
				tc.appendChild(p);
				dia.onclose((returnValue:any)=>{
					//後始末
					if(nc.parentNode===tc)tc.removeChild(nc);
					if(p.parentNode===tc)tc.removeChild(p);
					if(tc.parentNode)tc.parentNode.replaceChild(bc,tc);
					bc.style.display=null;
					//クローズ時は?
					if(this.helpdf){
						//dfがあれば元に戻す
						var range=document.createRange();
						range.selectNodeContents(helpco);
						range.deleteContents();
						helpco.appendChild(this.helpdf);
						range.detach();
					}
					if(callback)callback(returnValue);
				});
			}
		}
	}
	//ヘルプする
	function help(callback?:(helpel:HTMLElement)=>void):void{
		var helpel=<HTMLElement>document.getElementsByClassName("helpco")[0];
		empty(helpel);
		if(localStorage.getItem("nohelp")!=="true"){
			if(callback){
				callback(helpel);
				//ヘルプを消すボタン
				helpel.appendChild(el("p",(p)=>{
					p.appendChild(el("button",(button)=>{
						button.textContent="ヘルプを消す";
						button.title="ヘルプを消します。再びヘルプを見たい場合は設定画面から変更して下さい。";
						button.addEventListener("click",(e)=>{
							empty(helpel);
							localStorage.setItem("nohelp","true");
						},false);
					}));
				}));
			}
		}
	}
	//oh...
	function vendorPrefix(style:CSSStyleDeclaration,name:string,value:string,nameprefix:bool,valueprefix:bool){
		if(nameprefix){
			["-webkit-","-moz-",""].forEach((prefix)=>{
				setValue(prefix+name);
			});
		}else{
			setValue(name);
		}
		function setValue(name:string){
			if(valueprefix){
				["-webkit-","-moz-",""].forEach((prefix)=>{
					style.setProperty(name,prefix+value,null);
				});
			}else{
				style.setProperty(name,value,null);
			}
		}
	}
	function el(name:string,callback?:(e:HTMLElement)=>void):HTMLElement{
		var result=document.createElement(name);
		if(callback)callback(result);
		return result;
	}
	//アイコン生成
	module icons{
		export function gear(option:{
			radius1?:number;	//歯車の半径
			radius2?:number;	//内側の空洞の半径
			z?:number;	//歯の数
			length?:number;	//歯の長さ
			color?:string;
			//画像の設定
			width:string;
			height:string;
			anime?:string;	//アニメの種類
		}):SVGSVGElement{
			setDefault(option,{
				radius1:90,
				radius2:35,
				z:10,
				length:24,
				color:"#666666",
			});
			return <SVGSVGElement>svg("svg",(s:SVGElement)=>{
				var result=<SVGSVGElement>s;
				result.setAttribute("version","1.1");
				result.width.baseVal.valueAsString=option.width;
				result.height.baseVal.valueAsString=option.height;
				result.viewBox.baseVal.x=0, result.viewBox.baseVal.y=0, result.viewBox.baseVal.width=256, result.viewBox.baseVal.height=256;
				//歯車円の幅,半径
				var cwidth=option.radius1-option.radius2, cr=(option.radius1+option.radius2)/2;
				//1歯角と幅
				var tdeg=Math.PI/option.z, twidth=tdeg*option.radius1;

				//円をつくる
				result.appendChild(svg("circle",(c)=>{
					var circle=<SVGCircleElement>c;
					circle.cx.baseVal.valueAsString="128px", circle.cy.baseVal.valueAsString="128px";
					circle.r.baseVal.valueAsString=cr+"px";
					//線
					circle.setAttribute("fill","none");
					circle.setAttribute("stroke",option.color);
					circle.setAttribute("stroke-width",String(cwidth));
				}));
				//歯をつくる
				result.appendChild(svg("g",(g)=>{
					//まずアニメの設定
					if(option.anime){
						//var ani=<SVGAnimateTransformElement>svg("animateTransform");
						var ani=<SVGAnimationElement>svg("animateTransform");
						ani.setAttribute("attributeName","transform");
						ani.setAttribute("attributeType","XML");
						ani.setAttribute("type","rotate");
						ani.setAttribute("from","0 128 128");
						ani.setAttribute("to","360 128 128");
						ani.setAttribute("dur","5s");
						ani.setAttribute("repeatCount","indefinite");
						ani.setAttribute("begin","0s");
						ani.setAttribute("fill","freeze");
						g.appendChild(ani);
						switch(option.anime){
							case "hover":
								//オンマウスで動く
								registerHoverAnimation(result);
								break;
							case "always":
								//常に動く（なにもしない）
								break;
						}
				}
					var le=option.length+cwidth/2;
					for(var i=0;i<option.z;i++){
						g.appendChild(svg("line",(l)=>{
							var line=<SVGLineElement>l;
							var deg=2*i*tdeg;
							line.x1.baseVal.valueAsString=(128+cr*Math.cos(deg))+"px";
							line.y1.baseVal.valueAsString=(128+cr*Math.sin(deg))+"px";
							line.x2.baseVal.valueAsString=(128+(cr+le)*Math.cos(deg))+"px";
							line.y2.baseVal.valueAsString=(128+(cr+le)*Math.sin(deg))+"px";
							line.setAttribute("stroke",option.color);
							line.setAttribute("stroke-width",String(twidth));
						}));
					}
				}));
			});
		}
		export function clothgroup(option:{
			colors?:string[];	//色1〜3
			width:string;
			height:string;
		}):SVGSVGElement{
			setDefault(option,{
				colors:["#aaaaaa","#888888","#666666"],
			});
			return <SVGSVGElement>svg("svg",(r)=>{
				var result=<SVGSVGElement>r;
				result.width.baseVal.valueAsString=option.width;
				result.height.baseVal.valueAsString=option.height;
				result.viewBox.baseVal.x=0, result.viewBox.baseVal.y=0, result.viewBox.baseVal.width=256, result.viewBox.baseVal.height=256;
				for(var i=0;i<3;i++){
					var g=onecloth(option.colors[i]);
					var trtr=(i-1)*30;
					g.setAttribute("transform","translate("+trtr+" "+trtr+") scale(0.9)");
					result.appendChild(g);
				}
				//ひとつの服
				function onecloth(color:string):SVGGElement{
					return <SVGGElement>svg("g",(g)=>{
						var d=[
						"M10,90",	//袖の端からスタート
						"L90,40",	//襟のところへ
						"A80,70 0 0,0 166,40",//襟の上
						"L246,90",	//逆の袖の端へ
						"L216,138",	//袖口
						"L184,118",	//脇
						"L184,246",	//下へ
						"L72,246",	//反対側へ
						"L72,118",	//上へ
						"L40,138",	//袖口
						"Z",	//袖口
						].join(" ");
						g.appendChild(svg("path",(path)=>{
							path.setAttribute("d",d);
							path.setAttribute("fill",color);
						}));
					});
				}
			});
		}
		export function plus(option:{
			color?:string;	//色
			width:string;
			height:string;
		}):SVGSVGElement{
			setDefault(option,{
				color:"#666666",
			});
			return <SVGSVGElement>svg("svg",(r)=>{
				var result=<SVGSVGElement>r;
				result.width.baseVal.valueAsString=option.width;
				result.height.baseVal.valueAsString=option.height;
				result.viewBox.baseVal.x=0, result.viewBox.baseVal.y=0, result.viewBox.baseVal.width=256, result.viewBox.baseVal.height=256;
				result.appendChild(svg("g",(g)=>{
					//縦と横
					g.appendChild(svg("line",(l)=>{
						var line=<SVGLineElement>l;
						line.x1.baseVal.valueAsString="48px";
						line.y1.baseVal.valueAsString="128px";
						line.x2.baseVal.valueAsString="208px";
						line.y2.baseVal.valueAsString="128px";
						line.setAttribute("stroke-width","48px");
						line.setAttribute("stroke",option.color);
					}));
					g.appendChild(svg("line",(l)=>{
						var line=<SVGLineElement>l;
						line.x1.baseVal.valueAsString="128px";
						line.y1.baseVal.valueAsString="48px";
						line.x2.baseVal.valueAsString="128px";
						line.y2.baseVal.valueAsString="208px";
						line.setAttribute("stroke-width","48px");
						line.setAttribute("stroke",option.color);
					}));
				}));
			});
		}
		export function calender(option:{
			color?:string;	//色
			width:string;
			height:string;
		}):SVGSVGElement{
			setDefault(option,{
				color:"#777777",
			});
			return <SVGSVGElement>svg("svg",(r)=>{
				var result=<SVGSVGElement>r;
				result.width.baseVal.valueAsString=option.width;
				result.height.baseVal.valueAsString=option.height;
				result.viewBox.baseVal.x=0, result.viewBox.baseVal.y=0, result.viewBox.baseVal.width=256, result.viewBox.baseVal.height=256;
				result.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					rect.x.baseVal.valueAsString="30px";
					rect.y.baseVal.valueAsString="30px";
					rect.width.baseVal.valueAsString="196px";
					rect.height.baseVal.valueAsString="30px";
					rect.setAttribute("fill",option.color);
				}));
				//線をひく
				for(var x=0;x<5;x++){
					var xi=30+(196/4*x)+"px";
					result.appendChild(svg("line",(l)=>{
						var line=<SVGLineElement>l;
						line.x1.baseVal.valueAsString=xi;
						line.y1.baseVal.valueAsString="30px";
						line.x2.baseVal.valueAsString=xi;
						line.y2.baseVal.valueAsString="226px";
						line.setAttribute("stroke",option.color);
						line.setAttribute("stroke-width","8px");
					}));
				}
				for(var y=1;y<4;y++){
					var yi=60+(166/3*y)+"px";
					result.appendChild(svg("line",(l)=>{
						var line=<SVGLineElement>l;
						line.x1.baseVal.valueAsString="30px";
						line.y1.baseVal.valueAsString=yi;
						line.x2.baseVal.valueAsString="226px";
						line.y2.baseVal.valueAsString=yi;
						line.setAttribute("stroke",option.color);
						line.setAttribute("stroke-width","8px");
					}));
				}
			});
		}
		export function washer(option:{
			color?:string[];	//色
			width:string;
			height:string;
		}):SVGSVGElement{
			setDefault(option,{
				color:["#5e5e5e","#777777","#999999"],
			});
			return <SVGSVGElement>svg("svg",(r)=>{
				var result=<SVGSVGElement>r;
				result.width.baseVal.valueAsString=option.width;
				result.height.baseVal.valueAsString=option.height;
				result.viewBox.baseVal.x=0, result.viewBox.baseVal.y=0, result.viewBox.baseVal.width=256, result.viewBox.baseVal.height=256;
				//パス
				var d:string;
				//上の部分
				d=[
				"M25,45",	//左上
				"L127,90",	//下
				"L230,45",	//右上
				"L127,0",	//上
				"Z",	//左上
				//穴をあける
				"M60,45",
				"a65,28 0 1,1 130,0",
				"a65,28 0 1,1 -130,0",
				"Z",
				].join(" ");
				result.appendChild(path(d,{
					fill:option.color[1],
				}));
				//左の部分
				d=[
				"M25,45",	//左上
				"L25,205",	//左下
				"L127,250",	//下
				"L127,90",	//上
				"Z",	//左上
				].join(" ");
				result.appendChild(path(d,{
					fill:option.color[2],
				}));
				//右の部分
				d=[
				"M127,90",	//真ん中
				"L127,250",	//下
				"L230,205",	//右下
				"L230,45",	//右上
				"Z",	//真ん中
				].join(" ");
				result.appendChild(path(d,{
					fill:option.color[0],
				}));
			});
		}
		//アニメーション登録（メモリリーク避け）
		function registerHoverAnimation(el:SVGSVGElement):void{
			var flag:bool=false;
			el.pauseAnimations();
			el.addEventListener("mouseover",(e)=>{
				if(flag)return;
				el.unpauseAnimations();
				flag=true;
			},false);
			el.addEventListener("mouseout",(ee)=>{
				var e=<MouseEvent>ee;
				if(!flag)return;
				//relatedTarget（マウスの行き先）が傘下かどうか確認
				if(e.relatedTarget !== el && !(el.compareDocumentPosition(<Node>e.relatedTarget) & el.DOCUMENT_POSITION_CONTAINED_BY)){
					el.pauseAnimations();
					flag=false;
				}
			},false);
		}
		//デフォルト設定を書き込む ネスト非対応
		function setDefault(obj:any,def:any):void{
			for(var key in def){
				if(!(key in obj)){
					obj[key]=def[key];
				}
			}
		}
	}
	//領域
	module selectbox{
		export function scheduler(doc:SchedulerDoc,option:{
			del?:bool;
		},clickhandler?:(mode:string)=>void):HTMLElement{
			return el("div",(div)=>{
				div.classList.add("schedulerbox");
				div.classList.add("selection");
				//アイコン
				switch(doc.type){
					case "calender":
						div.appendChild(icons.calender({
							width:"32px",
							height:"32px",
						}));
						break;
				}
				div.appendChild(document.createTextNode(doc.name));
				if(option.del){
					//削除ボタン追加
					div.appendChild(el("button",(b)=>{
						var button=<HTMLButtonElement>b;
						button.classList.add("deletebutton");
						button.textContent="✗";
					}));
				}
				if(clickhandler){
					div.addEventListener("click",(e)=>{
						var t=<HTMLElement><any>e.target;
						if(t.classList.contains("deletebutton")){
							//削除だ!
							clickhandler("delete");
						}else{
							clickhandler("normal");
						}
					},false);
				}
			});
		}
		export function clothgroup(doc:ClothGroupDoc,option:{
			del?:bool;
		},clickhandler?:(mode:string)=>void):HTMLElement{
			if(!option){
				option={};
			}
			return el("div",(div)=>{
				div.classList.add("clothgroupbox");
				div.classList.add("selection");
				//アイコン
				div.appendChild(icons.clothgroup({
					width:"32px",
					height:"32px",
				}));
				div.appendChild(document.createTextNode(doc.name));
				if(option.del){
					//削除ボタン追加
					div.appendChild(el("button",(b)=>{
						var button=<HTMLButtonElement>b;
						button.classList.add("deletebutton");
						button.textContent="✗";
					}));
				}
				if(clickhandler){
					div.addEventListener("click",(e)=>{
						var t=<HTMLElement><any>e.target;
						if(t.classList.contains("deletebutton")){
							//削除だ!
							clickhandler("delete");
						}else{
							clickhandler("normal");
						}
					},false);
				}
			});
		}
		export function cloth(doc:ClothDoc,option:{
			size?:string;	//width & height
		},clickhandler?:(mode:string)=>void):HTMLElement{
			if(!option)option={};
			if(!option.size)option.size="64px";
			return el("div",(div)=>{
				div.classList.add("clothbox");
				div.classList.add("selection");
				//アイコン
				var cloth=Cloth.importCloth({
					type:doc.type,
					patterns:doc.patterns,
				});
				div.appendChild(cloth.getSVG(option.size,option.size));
				if(clickhandler){
					div.addEventListener("click",(e)=>{
						clickhandler("normal");
					},false);
				}
				if(doc.name){
					div.title=doc.name;
				}
			});
		}
	}
	//util
	function empty(el:Element):void{
		while(el.firstChild)el.removeChild(el.firstChild);
	}
	function zeroDate(d:Date):Date{
		//時刻セット
		var result=new Date(d.getTime());
		result.setHours(0);
		result.setMinutes(0);
		result.setSeconds(0);
		result.setMilliseconds(0);
		return result;
	}
}
//What a global!
function svg(name:string,callback?:(g:SVGElement)=>void):SVGElement{
	var result=<SVGElement>document.createElementNS(Cloth.svgNS,name);
	if(callback){
		callback(result);
	}
	return result;
}
function path(d:string,v:{
	fill?:string;
	stroke?:string;
	sw?:number;
	slj?:string;
},callback?:(pp:SVGPathElement)=>void):SVGPathElement{
	var p=<SVGPathElement>svg("path");
	//p.setAttributeNS(Cloth.svgNS,"d",d);
	p.setAttribute("d",d);
	if(v){
		p.setAttribute("fill", v.fill || "none");
		p.setAttribute("stroke", v.stroke || "none");
		p.setAttribute("stroke-width",String(v.sw || 1));
		p.setAttribute("stroke-linejoin",v.slj || "miter");
	}
	if(callback){
		callback(p);
	}
	return p;
}


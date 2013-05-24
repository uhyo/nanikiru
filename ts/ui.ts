///<reference path="db.ts"/>
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
/* 便宜的にあってほしいやつ ダックタイピング最高 */
interface _SVGSomeBox extends SVGElement{
	x:SVGAnimatedLength;
	y:SVGAnimatedLength;
	width:SVGAnimatedLength;
	height:SVGAnimatedLength;
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
		public clothScores:{
			[index:string]:number;
		};
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
		private loadLogs(d:Date):void{
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
							var setting=new SchedulerConfig(this.db,this);
							var modal=new ModalUI(this);
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
				this.calculateScore(logs,d);
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
		private calculateScore(logs:{
			[index:string]:LogDoc;
		},d:Date,callback?:()=>void=function(){}):void{
			var db=this.db,doc:SchedulerDoc=this.doc;
			if(!this.clothScores)this.clothScores={};
			var cs=this.clothScores;
			//cs format:JSON clothid array(sorted)
			var clothscores:{
				[index:number]:number;	//clothid:score
			}=<any>{};
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
						//
						if(clothscores[clothid]==null){
							clothscores[clothid]=-sub;
						}else{
							clothscores[clothid]-=sub;
						}
					});
				}
			}
			//さて、出揃った。組み合わせ計算
			var mains=doc.groups.slice(0,2);
			if(mains.length===0){
				callback();
				return;	//何もないじゃん!
			}
			if(mains.length===1){
				//ひとつじゃん!
				db.eachCloth({
					group:mains[0],
				},(cdoc:ClothDoc)=>{
					if(cdoc!=null){
						cs["["+cdoc.id+"]"]=cdoc.status!=="active" ? -Infinity : clothscores[cdoc.id] || 0;
					}else{
						callback();
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
					}else{
						//もうない! 2つ目
						var cloths2=[];
						db.eachCloth({
							group:mains[1],
						},(cdoc:ClothDoc)=>{
							if(cdoc!=null){
								cloths2.push(cdoc.id);
							}else{
								//全部調べた!
								cloths1.forEach((cid1)=>{
									cloths2.forEach((cid2)=>{
										var score=(clothscores[cid1]||0)+(clothscores[cid2]||0);
										var keyarr=[cid1,cid2].sort();
										cs[JSON.stringify(keyarr)]=score;
									});
								});
								//できた
								callback();
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
					dl.appendChild(el("dt",(dt)=>{
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
					}));
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
					doc.type=(<HTMLInputElement>(<HTMLFormElement>form).elements["type"]).value;
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
	//日付表示
	export class DateIndicator extends UISection{
		constructor(private scheduler:Scheduler){
			super();
			var date=scheduler.date;
			var c=this.getContent();
			c.classList.add("dateindicator");
			c.appendChild(el("h1",(h1)=>{
				h1.appendChild(el("time",(t)=>{
					var time=<HTMLTimeElement>t;
					
					time.dateTime=date.toJSON();
					time.textContent=(date.getMonth()+1)+"/"+date.getDate();
				}));
			}));
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
			var clothScores=scheduler.clothScores;
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
																td.appendChild(c1col[i].getSVG("24px","24px"));
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
															td.appendChild(c2svg.getSVG("24px","24px"));
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
						var setting=new SchedulerConfig(this.db,result);
						var modal=new ModalUI(result);
						modal.slide("simple",setting,(returnValue:any)=>{
							//よみ直す
							this.close("scheduler::open:"+this.id);
						});
					}
					//日付部分
					var datewin=new DateIndicator(result);
					c.appendChild(datewin.getContent());
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
								var list2=new ClothGroupList(db,{
									add:false,
									del:false,
								});
								var modal=new ModalUI(_self);
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
								var info=new NewClothGroup(db,option.schedulerid);
								var modal=new ModalUI(_self);
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
										var sel=new ClothSelect(null);
										var modal=new ModalUI(_self);
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
							div.appendChild(sample.getSVG("32px","32px"));
						}));
					});
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
					type:"T-shirt",
					patterns:[],
				};
			}
			this.setType();
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
							var sel=new ClothSelect({
								type:doc.type,
								patterns:doc.patterns,
							});
							var modal=new ModalUI(this);
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
					section.appendChild(el("p",(p)=>{
						if(doc.used>0){
							p.textContent="洗濯後"+doc.used+"回使用";
						}else{
							p.textContent="洗濯後未使用";
						}
					}));
					if(doc.status==="washer"){
						section.appendChild(el("p",(p)=>{
							p.textContent="洗濯中";
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
											var info=new ClothGroupInfo(db,cgdoc.id);
											var modal=new ModalUI(_self);
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
								var list=new ClothGroupList(db,{
									del:false,
								});
								var modal=new ModalUI(this);
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
		}
	}
	//割り込みUI
	class ModalUI{
		private container:HTMLElement;
		private returnValue:any=void 0;
		private dia:UIObject;
		constructor(private ui:UIObject){
			this.container=document.createElement("div");
			var c=ui.getContent();
			if(c.parentNode){
				//入れる
				c.parentNode.replaceChild(this.container,c);
				this.container.appendChild(c);
			}
		}
		//画面割り込み発生!
		slide(mode:string,dia:UIObject,callback?:(returnValue:any)=>void):void{
			this.dia=dia;
			var tc=this.container, bc=this.ui.getContent(), nc=dia.getContent();
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
					if(callback)callback(returnValue);
				});
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
			if(!option.size)option.size="32px";
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
class Cloth{
	private clothType:string=null;	//服の形
	private patterns:PatternObj[]=[];		//パターンたち（どのパターン番号がどの部分にあたるかは服による）

	static svgNS="http://www.w3.org/2000/svg";
	//服の通し番号
	static clothId:number=0;
	//服の種類一覧
	static clothTypes:{
		type:string;
		patternNumber:number;
	}[]=[
		{
			type:"T-shirt",
			patternNumber:2,
		}
	];
	//服のデフォルト色
	static defaultColors:string[]=["#666666","#cccccc","#eeeeee","#999999","#333333"];
	//パターンの種類と要求色数
	static patternTypes:{
		type:string;	//パターン名
		requiresSize:bool;
		defaultSize:number;
		colorNumber:number;
	}[]=[
		{
			type:"simple",
			requiresSize:false,
			defaultSize:0,
			colorNumber:1,
		}
	];
	//JSON的なobjから作る
	importCloth(obj:{
		type:string;
		patterns:PatternObj[];
	}):void{
		this.clothType = obj.type || null;
		this.patterns = Array.isArray(obj.patterns) ? obj.patterns : [];
	}
	static importCloth(obj:{
		type:string;
		patterns:PatternObj[];
	}):Cloth{
		var c=new Cloth();
		c.importCloth(obj);
		return c;
	}
	//出す
	exportCloth():any{
		return {
			type:this.clothType,
			patterns:this.patterns,
		};
	}
	//SVG要素を出力
	getSVG(width?:string="256px",height?:string="256px"):SVGSVGElement{
		var svg:SVGSVGElement;
		//svgを作る
		svg=<SVGSVGElement>document.createElementNS(Cloth.svgNS,"svg");
		svg.setAttribute("version","1.1");
		svg.viewBox.baseVal.x=0, svg.viewBox.baseVal.y=0, svg.viewBox.baseVal.width=256, svg.viewBox.baseVal.height=256;
		svg.id="cloth"+(Cloth.clothId++);
		this.makeCloth(svg);
		//幅設定
		svg.width.baseVal.valueAsString=width;
		svg.height.baseVal.valueAsString=height;

		return svg;
	}
	//服をつくる
	private makeCloth(el:SVGSVGElement):void{
		var type=this.clothType, patterns=this.patterns;
		//パターンを入れるとこ
		var defs=svg("defs");
		el.appendChild(defs);
		//服の種類ごとに
		var d:string;
		switch(type){
			//UネックのTシャツ
			case "T-shirt":
				//パス:左下から
				d=[
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
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				//Uネックの部分
				d=[
				"M90,40",	//襟のところ
				"A80,70 0 0,0 166,40",//上のえり（重なる）
				"A74,250 0 0,1 90,40",//下のえり
				"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
					slj:"bevel",
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(1)+")");
				}));
				break;
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
		function makePattern(index:number):string{
			//パターンを作ってあげる idを返す
			var pat:{
				type:string;
				size:number;
				colors:string[];
			}=patterns[index];
			if(!pat){
				//足りない!!!!!!!!
				pat={
					type:"simple",
					size:0,
					colors:[Cloth.defaultColors[index]],
				};
			}
			var pattern=Cloth.makePattern(pat);
			pattern.id=el.id+"-pattern"+index;
			defs.appendChild(pattern);
			return el.id+"-pattern"+index;
		}
	}
	static makePattern(pat:PatternObj):SVGPatternElement{
		var pattern=<SVGPatternElement>document.createElementNS(Cloth.svgNS,"pattern");
		//タイプごと
		switch(pat.type){
			case "simple":
				//単色
				setwh(pattern,0,0,256,256);
				setvb(pattern.viewBox,0,0,256,256);
				//その色でうめる
				pattern.setAttribute("patternUnits","userSpaceOnUse");
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,0,256,256);
					rect.setAttribute("fill",pat.colors[0]);
				}));
				break;
		}
		return pattern;
		function setwh(pattern:_SVGSomeBox,x:number,y:number,width:number,height:number):void{
			pattern.x.baseVal.valueAsString=x+"px";
			pattern.y.baseVal.valueAsString=y+"px";
			pattern.width.baseVal.valueAsString=width+"px";
			pattern.height.baseVal.valueAsString=height+"px";
		}
		function setvb(pattern:SVGAnimatedRect,x:number,y:number,width:number,height:number):void{
			pattern.baseVal.x=x;
			pattern.baseVal.y=y;
			pattern.baseVal.width=width;
			pattern.baseVal.height=height;
		}
	}
	static changePattern(index:number,pat:PatternObj,vg:SVGSVGElement):void{
		//すでにあるやつのパターンを変更してほしい
		var defs=<Element>vg.getElementsByTagNameNS(Cloth.svgNS,"defs")[0];
		var pats=defs.getElementsByTagNameNS(Cloth.svgNS,"pattern");
		for(var i=0,l=pats.length;i<l;i++){
			if((<SVGElement>pats[i]).id===vg.id+"-pattern"+index){
				//これだ!
				var newpatt=Cloth.makePattern(pat);
				newpatt.id=vg.id+"-pattern"+index;
				defs.replaceChild(newpatt,pats[i]);
				break;
			}
		}
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


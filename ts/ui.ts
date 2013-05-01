///<reference path="db.ts"/>
///<reference path="clothes.ts"/>
//additional definition
interface HTMLElement{
	hidden:bool;
}
interface HTMLTimeElement extends HTMLElement{
	dateTime:string;
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
		constructor(public doc:SchedulerDoc){
			super();
		}
		setDate(d:Date):void{
			this.date=d;
			this.render(d);
		}
		//描画する
		render(d:Date):void{
		}
		//得るやつ
		static getScheduler(db:DB,id:number,callback:(result:Scheduler)=>void):void{
			db.getScheduler(id,(doc:SchedulerDoc)=>{
				//わーいスケジュールあったー
				if(!doc)callback(null);
				Scheduler.makeScheduler(doc,db,callback);
			});
		}
		static makeScheduler(doc:SchedulerDoc,db:DB,callback:(result:Scheduler)=>void):void{
			var result:Scheduler=null;
			switch(doc.type){
				case "calender":
					result=new Calender(doc,db);
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
		constructor(public doc:SchedulerDoc,private db:DB){
			super(doc);
		}
		//この日付でカレンダーを描画
		render(d:Date):void{
			var c=this.getContent();
			c.classList.add("calender");

			var currentMonth=d.getMonth(), currentDate=d.getDate();
			var mv=new Date(d.toJSON());	//clone
			mv.setDate(1);	//とりあえず今月のついたちにする
			//日曜まで戻す
			mv.setDate(1-mv.getDay());
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
					td.appendChild(el("div",(div)=>{
						div.classList.add("date");
						div.appendChild(el("time",(time)=>{
							var t=<HTMLTimeElement>time;
							t.dateTime=mv.getFullYear()+"-"+(mn+1)+"-"+dd;
							t.textContent = (mn!==currentMonth ? (mn+1)+"/" : "")+dd;
						}));
					}));
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
							if(returnValue){
								//DBを書き換えた
								this.close("reload");
							}
						});
					},false);
				}));
				div.appendChild(el("button",(b)=>{
					var button=<HTMLButtonElement>b;
					button.title="服グループ";
					button.appendChild(Cloth.importCloth({
						clothType:"T-shirt",
						colors:["#999999","#999999"],
					}).getSVG("24px","24px"));
					button.addEventListener("click",(e)=>{
						//あれー
						//服グループ管理画面に移行する
						this.close("clothGroupEdit");
					},false);
				}));
			}));
			c.appendChild(t);
		}
	}
	//スケジューラ設定
	export class SchedulerConfig extends UISection{
		constructor(private db:DB,private scheduler:Scheduler){
			super();
			//初期化
			var c=this.getContent();
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
					p.appendChild(el("input",(i)=>{
						var input=<HTMLInputElement>i;
						input.type="button";
						input.value="キャンセル";
						input.addEventListener("click",(e)=>{
							//セーブせずに終了
							this.close(false);
						},false);
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
		}
		save(doc:SchedulerDoc):void{
			//DBに書き込む
			var db=this.db;
			db.setScheduler(doc,(result:bool)=>{
				this.close(true);	//新しいDBがほしい!
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
	//スケジューラコンテナ
	export class SchedulerContainer extends UIObject{
		private date:Date;
		constructor(public id:any,private db:DB){
			//id:スケジューラのID
			super();
		}
		open():void{
			UI.Scheduler.getScheduler(this.db,this.id,(result:Scheduler)=>{
				var c=this.getContent();
				c.classList.add("scheduler-container");
				while(c.firstChild)c.removeChild(c.firstChild);
				if(result){
					//hard!
					this.id=result.doc.id;	//id保存
					result.setDate(new Date);
					c.appendChild(result.getContent());
					result.onclose((returnValue:any)=>{

						if(returnValue==="reload"){
							//読みなおしてほしい
							this.open();
						}else{
							//それ以外だったら道連れ終了
							this.close(returnValue);
						}
					});
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
	//服グループのリスト
	export class ClothGroupList extends UISection{
		constructor(private db:DB,private schedulerid?:number){
			super();
			var _self=this;
			var c=this.getContent();
			c.classList.add("clothgroup-list");
			var count:number=0;	//表示済みのやつを数える
			if(schedulerid!=null){
				db.getScheduler(schedulerid,(schedulerdoc:SchedulerDoc)=>{
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
					c.appendChild(selectbox.clothgroup(doc,(e)=>{
						//個別の設定画面へ!
						var info=new ClothGroupInfo(db,doc.id);
						var modal=new ModalUI(_self);
						modal.slide("simple",info,(mode?:string)=>{
							if(mode!=null){
								_self.close(mode);
							}
						});
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
				c.appendChild(el("p",(p)=>{
					p.appendChild(el("button",(b)=>{
						var button=<HTMLButtonElement>b;
						button.appendChild(icons.plus({
							color:"#666666",
							width:"24px",
							height:"24px",
						}));
						button.appendChild(document.createTextNode("新しい服グループを追加"));
						button.addEventListener("click",(e)=>{
							//新しいやつを追加したいなあ・・・
							var info=new ClothGroupInfo(db,null,schedulerid);
							var modal=new ModalUI(_self);
							modal.slide("simple",info,(returnValue?:any)=>{
								if(returnValue!=null){
									//伝えたいことがあるんだ
									_self.close(returnValue);
								}
							});
						},false);
					}));
				}));
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
								console.log(doc,id);
								if(id!=null){
									//idをゲットした!
									doc.id=id;
									_self.clothgroupid=id;
									if(schedulerid!=null){
										//新規で登録したい
										db.getScheduler(schedulerid,(schedulerdoc:SchedulerDoc)=>{
											console.log(schedulerdoc);
											if(schedulerdoc){
												if(schedulerdoc.groups.indexOf(id)<0){
													schedulerdoc.groups.push(id);
													db.setScheduler(schedulerdoc,(result:bool)=>{
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
						section.appendChild(selectbox.scheduler(sdoc,(mode:string)=>{
							//スケジューラを開く
							_self.close("scheduler::"+sdoc.id);
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
									},false);
								}));
							}));
							return;
						}
						section.appendChild(selectbox.cloth(cdoc,(mode:string)=>{
							//スケジューラを開く
							_self.close("cloth::"+cdoc.id);
						}));
						count++;
					});
				}));
				//戻る
				c.appendChild(el("p",(p)=>{
					p.appendChild(el("button",(b)=>{
						var button=<HTMLButtonElement>b;
						button.textContent="戻る";
						button.addEventListener("click",(e)=>{
							_self.close();
						},false);
					}));
				}));
			}
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
		slide(mode:string,dia:UIObject,callback?:(returnValue?:any)=>void):void{
			this.dia=dia;
			var tc=this.container, bc=this.ui.getContent(), nc=dia.getContent();
			if(mode==="simple"){
				//ただの切り替え
				bc.style.display="none";
				tc.appendChild(nc);
			}
			dia.onclose((returnValue:any)=>{
				//後始末
				if(nc.parentNode===tc)tc.removeChild(nc);
				if(tc.parentNode)tc.parentNode.replaceChild(bc,tc);
				bc.style.display=null;
				//クローズ時は?
				if(callback)callback(returnValue);
			});
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
		var svgNS="http://www.w3.org/2000/svg";
		function svg(name:string,callback?:(g:SVGElement)=>void):SVGElement{
			var result=<SVGElement>document.createElementNS(svgNS,name);
			if(callback){
				callback(result);
			}
			return result;
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
		export function scheduler(doc:SchedulerDoc,clickhandler?:(mode:string)=>void):HTMLElement{
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
				if(clickhandler){
					div.addEventListener("click",(e)=>{
						clickhandler("normal");
					},false);
				}
			});
		}
		export function clothgroup(doc:ClothGroupDoc,clickhandler?:(mode:string)=>void):HTMLElement{
			return el("div",(div)=>{
				div.classList.add("clothgroupbox");
				div.classList.add("selection");
				//アイコン
				div.appendChild(icons.clothgroup({
					width:"32px",
					height:"32px",
				}));
				div.appendChild(document.createTextNode(doc.name));
				if(clickhandler){
					div.addEventListener("click",(e)=>{
						clickhandler("normal");
					},false);
				}
			});
		}
		export function cloth(doc:ClothDoc,clickhandler?:(mode:string)=>void):HTMLElement{
			return el("div",(div)=>{
				div.classList.add("clothbox");
				div.classList.add("selection");
				//アイコン
				var cloth=Cloth.importCloth(doc);
				div.appendChild(cloth.getSVG("32px","32px"));
				if(clickhandler){
					div.addEventListener("click",(e)=>{
						clickhandler("normal");
					},false);
				}
			});
		}
	}
	//util
	function empty(el:Element):void{
		while(el.firstChild)el.removeChild(el.firstChild);
	}
}

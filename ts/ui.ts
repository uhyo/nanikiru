///<reference path="db.ts"/>
//additional definition
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
		private date:Date;
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
						input.type="button";
						input.value="変更を保存";
						input.addEventListener("click",(e)=>{
							//変更をセーブしたい
							var form=input.form;
							doc.type=(<HTMLInputElement>form.elements["type"]).value;
							doc.name=(<HTMLInputElement>form.elements["name"]).value;
							//save & close
							this.save(doc);
						},false);
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
	//スケジューラコンテナ
	export class SchedulerContainer extends UIObject{
		constructor(private id:any,private db:DB){
			//id:スケジューラのID
			super();
		}
		open():void{
			UI.Scheduler.getScheduler(this.db,this.id,(result:Scheduler)=>{
				var c=this.getContent();
				while(c.firstChild)c.removeChild(c.firstChild);
				if(result){
					//hard!
					this.id=result.doc.id;	//id保存
					result.render(new Date);
					c.appendChild(result.getContent());
					result.onclose((returnValue:any)=>{

						if(returnValue==="reload"){
							//読みなおしてほしい
							this.open();
						}else{
							//それ以外だったら道連れ終了
							this.close();
						}
					});
				}else{
					c.appendChild(el("p",(p)=>{
						p.textContent="スケジューラがありません。";
					}));
				}
			});
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
				//クローズ時は?
				if(callback)callback(returnValue);
				//後始末
				if(nc.parentNode===tc)tc.removeChild(nc);
				bc.style.display=null;
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
			radius1:number;	//歯車の半径
			radius2:number;	//内側の空洞の半径
			z:number;	//歯の数
			length:number;	//歯の長さ
			color:string;
			//画像の設定
			width:string;
			height:string;
			anime?:string;	//アニメの種類
		}):SVGSVGElement{
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
	}
}

///<reference path="db.ts"/>
//additional definition
interface HTMLTimeElement extends HTMLElement{
	dateTime:string;
}
module UI{
	//UIオブジェクト
	export class UIObject{
		private container:HTMLElement;
		constructor(){
			this.container=document.createElement("div");
		}
		getContent():HTMLElement{
			return this.container;
		}
	}

	//スケジューラ
	export class Scheduler extends UIObject{
		private date:Date;
		setDate(d:Date):void{
			this.date=d;
			this.render(d);
		}
		//描画する
		render(d:Date):void{
		}
	}
	//カレンダー
	export class Calender extends Scheduler{
		constructor(private db:DB){
			super();
		}
		//この日付でカレンダーを描画
		render(d:Date):void{
			var c=this.getContent();
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
			c.appendChild(t);
		}
	}
	function el(name:string,callback?:(e:HTMLElement)=>void):HTMLElement{
		var result=document.createElement(name);
		if(callback)callback(result);
		return result;
	}
}

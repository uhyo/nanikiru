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
	}
	//カレンダー
	export class Calender extends Scheduler{
	}
}

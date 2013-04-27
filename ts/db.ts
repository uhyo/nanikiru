//DB-Object
interface ClothDoc{
	id:number;
	type:string;
	colors:string[];
	group:number[];
	used:number;
	status:string;
	made:Date;
	lastuse:Date;
}
interface ClothGroupDoc{
	id:number;
	name:string;
	made:Date;
}
interface SchedulerDoc{
	id:number;
	type:string;
	name:string;
	made:Date;
	groups:number[];
}
interface LogDoc{
	id:number;
	scheduler:number;
	cloth:number[];
	date:Date;
}

//db
class DB{
	private name:string="nanikiru";	//データベースの名前
	private db:IDBDatabase;
	open(callback?:(r:bool)=>void):void{
		//DBに接続するぞ!!!
		var request:IDBOpenDBRequest=indexedDB.open(this.name,1);
		request.addEventListener("upgradeneeded",(e:IDBVersionChangeEvent)=>{
			//DB定義
			var db:IDBDatabase=request.result;
			var old:number=e.oldVersion;
			//データベースがはじめて作られた
			if(old<1){
				//ふふふ、ぼくの設計は完璧だからあとからDBの仕様を変えるなんてことないぞ
				var cloth=db.createObjectStore("cloth",{
					keyPath:"id",
					autoIncrement:true,
				});
				//インデックス
				cloth.createIndex("type","type",{
					unique:false, multiEntry:false,
				});
				cloth.createIndex("group","group",{
					unique:false, multiEntry:true,
				});
				cloth.createIndex("status","status",{
					unique:false, multiEntry:true,
				});

				var clothgroup=db.createObjectStore("clothgroup",{
					keyPath:"id",
					autoIncrement:true,
				});

				var scheduler=db.createObjectStore("scheduler",{
					keyPath:"id",
					autoIncrement:true,
				});
				scheduler.createIndex("type","type",{
					unique:false, multiEntry:false,
				});
				
				var log=db.createObjectStore("log",{
					keyPath:"id",
					autoIncrement:true,
				});
				log.createIndex("scheduler","scheduler",{
					unique:false, multiEntry:true,
				});
				//まとめて検索用
				log.createIndex("cloth_complex","cloth",{
					unique:false, multiEntry:false,
				});
				//服個別検索用
				log.createIndex("cloth_multi","cloth",{
					unique:false, multiEntry:true,
				});

				//初期カレンダーを作る
				var req=scheduler.add({
					"type":"calender",
					"name":"カレンダー",
					"made":new Date(),
				});
				req.addEventListener("success",(e)=>{
					console.log("新しいカレンダーが作成されました。");
				});
				req.addEventListener("error",(e)=>{
					console.error("カレンダーの作成に失敗しました。");
				});
				delete req;
			}
		});
		request.addEventListener("success",(e)=>{
			//成功
			this.db=request.result;
			if(callback)callback(true);
		});
		request.addEventListener("error",(e)=>{
			console.error("DB open error:",request.error);
			if(callback)callback(false);
		});
	}
	//DB getter
	getScheduler(id:number,callback:(doc:SchedulerDoc)=>void):void{
		var tr=this.db.transaction("scheduler","readonly");
		var scheduler=tr.objectStore("scheduler");
		var req:IDBRequest=scheduler.get(id);
		req.addEventListener("success",(e)=>{
			callback(<SchedulerDoc>req.result);
		});
		req.addEventListener("error",(e)=>{
			console.error("getScheduler error:",req.error);
			callback(null);
		});
		delete req;
	}
	//DB setter
	setScheduler(doc:SchedulerDoc,callback:(result:bool)=>void):void{
		var tr=this.db.transaction("scheduler","readwrite");
		var scheduler=tr.objectStore("scheduler");
		var req:IDBRequest=scheduler.put(doc);
		req.addEventListener("success",(e)=>{
			//トランザクションを終了させてからコールバック
			setTimeout(()=>{
				callback(true);
			},0);
		});
		req.addEventListener("error",(e)=>{
			console.error("getScheduler error:",req.error);
			callback(false);
		});
		delete req;
	}
	//cloth group
	getClothGroup(id:number,callback:(result:ClothGroupDoc)=>void):void{
		var tr=this.db.transaction("clothgroup","readonly");
		var clothgroup=tr.objectStore("clothgroup");
		var req:IDBRequest=clothgroup.get(id);
		req.addEventListener("success",(e)=>{
			callback(<ClothGroupDoc>req.result);
		});
		req.addEventListener("error",(e)=>{
			console.error("getClothGroup error:",req.error);
			callback(null);
		});
		delete req;
	}
	eachClothGroup(keyrange:any,callback:(result:ClothGroupDoc)=>void):void{
		//keyrange: null is ok
		var tr=this.db.transaction("clothgroup","readonly");
		var clothgroup=tr.objectStore("clothgroup");
		var req:IDBRequest=clothgroup.openCursor(keyrange,"next");
		if(req==null){
			callback(null);	//ひとつもない
			return;
		}
		req.addEventListener("success",(e)=>{
			//nullかも
			var cursor=req.result;
			if(!cursor){
				//もうない
				callback(null);
				return;
			}else{
				//まだある!続行
				callback(<ClothGroupDoc>cursor.value);
				cursor.advance(1);
			}
		});
		req.addEventListener("error",(e)=>{
			console.error("eachClothGroup error:",req.error);
			callback(null);
		});
		delete req;
	}
}

/*addition*/
interface IDBObjectStore{
	delete:(key:any)=>IDBRequest;
}
//DB-Object
interface PatternObj{
	type:string;
	size:number;
	colors:string[];
}
interface ClothDoc{
	id:number;
	name:string;
	type:string;
	patterns:PatternObj[];
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
				scheduler.createIndex("groups","groups",{
					unique:false, multiEntry:true,
				});
				
				var log=db.createObjectStore("log",{
					keyPath:"id",
					autoIncrement:true,
				});
				log.createIndex("scheduler","scheduler",{
					unique:false, multiEntry:false,
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
					"groups":[],
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
	setScheduler(doc:SchedulerDoc,callback:(result:number)=>void):void{
		var tr=this.db.transaction("scheduler","readwrite");
		var scheduler=tr.objectStore("scheduler");
		var req:IDBRequest=scheduler.put(doc);
		req.addEventListener("success",(e)=>{
			//トランザクションを終了させてからコールバック
			setTimeout(()=>{
				callback(<number>req.result);
			},0);
		});
		req.addEventListener("error",(e)=>{
			console.error("getScheduler error:",req.error);
			callback(null);
		});
		delete req;
	}
	eachScheduler(cond:{
		keyrange?:any;
		type?:string;
		group?:number;
	},callback:(result:SchedulerDoc)=>void):void{
		var tr=this.db.transaction("scheduler","readonly");
		var scheduler=tr.objectStore("scheduler");
		var req:IDBRequest;
		if(cond.type!=null){
			req=scheduler.index("type").openCursor(<any>cond.type,"next");
		}else if(cond.group!=null){
			req=scheduler.index("groups").openCursor(<any>cond.group,"next");
		}else{
			//keyrange: nullable
			req=scheduler.openCursor(cond.keyrange||null,"next");
		}
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
				callback(<SchedulerDoc>cursor.value);
				cursor.advance(1);
			}
		});
		req.addEventListener("error",(e)=>{
			console.error("eachClothGroup error:",req.error);
			callback(null);
		});
		delete req;
	}
	removeScheduler(id:number,callback:(result:bool)=>void):void{
		var tr=this.db.transaction("scheduler","readwrite");
		var scheduler=tr.objectStore("scheduler");
		var req:IDBRequest=scheduler.delete(id);
		req.addEventListener("success",(e)=>{
			//トランザクションを終了させてからコールバック
			setTimeout(()=>{
				callback(true);
			},0);
		});
		req.addEventListener("error",(e)=>{
			console.error("removeScheduler error:",req.error);
			callback(false);
		});
		delete req;
	}
	//関連データ消去
	cleanupScheduler(id:number,callback:(result:bool)=>void):void{
		this.removeScheduler(id,(result:bool)=>{
			if(result && localStorage.getItem("lastScheduler")===String(id)){
				//なくなってしまった・・・
				localStorage.removeItem("lastScheduler");
			}
			callback(result);
		});
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
	setClothGroup(doc:ClothGroupDoc,callback:(result:number)=>void):void{
		var tr=this.db.transaction("clothgroup","readwrite");
		var clothgroup=tr.objectStore("clothgroup");
		var req:IDBRequest=clothgroup.put(doc);
		req.addEventListener("success",(e)=>{
			setTimeout(()=>{
				callback(req.result);
			},0);
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
	/* 使うのか? */
	removeClothGroup(id:number,callback:(result:bool)=>void):void{
		var tr=this.db.transaction("clothgroup","readwrite");
		var clothgroup=tr.objectStore("clothgroup");
		var req:IDBRequest=clothgroup.delete(id);
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
	cleanupClothGroup(id:number,callback:(result:bool)=>void):void{
		var tr=this.db.transaction(["clothgroup","cloth","scheduler"],"readwrite");
		var clothgroup=tr.objectStore("clothgroup"), cloth=tr.objectStore("cloth"), scheduler=tr.objectStore("scheduler");
		//まずclothgroupから削除
		var req=clothgroup.delete(id);
		req.addEventListener("success",(e)=>{
			//次
			var req2=cloth.index("group").openCursor(<any>id,"next");
			if(!req2){
				//ひとつもない
				nx();
				return;
			}
			req2.addEventListener("success",(e)=>{
				//nullかも
				var cursor=req2.result;
				if(!cursor){
					//もうない
					nx();
					return;
				}else{
					//あった
					var cl=<ClothDoc>cursor.value;
					cl.group=cl.group.filter((x)=>{
						return x!==id;
					});
					var req2_1=cloth.put(cl);
					req2_1.addEventListener("success",(e)=>{
						cursor.advance(1);
					});
					req2_1.addEventListener("error",(e)=>{
						console.error("cleanupClothgroup error:",req.error);
						tr.abort();
						callback(false);
					});
				}
			});
			req2.addEventListener("error",(e)=>{
				console.error("cleanupClothGroup error:",req.error);
				tr.abort();
				callback(false);
			});
			function nx(){
				//clothを全てきれいにした。
				var req3=scheduler.index("groups").openCursor(<any>id,"next");
				if(!req3){
					//完了
					setTimeout(()=>{
						callback(true);
					},0);
					return;
				}
				req3.addEventListener("success",(e)=>{
					//nullかも
					var cursor=req3.result;
					if(!cursor){
						//もうない
						setTimeout(()=>{
							callback(true);
						},0);
						return;
					}else{
						//あった
						var sc=<SchedulerDoc>cursor.value;
						sc.groups=sc.groups.filter((x)=>{
							return x!==id;
						});
						var req3_1=scheduler.put(sc);
						req3_1.addEventListener("success",(e)=>{
							cursor.advance(1);
						});
						req3_1.addEventListener("error",(e)=>{
							console.error("cleanupClothgroup error:",req.error);
							tr.abort();
							callback(false);
						});
					}
				});
				req2.addEventListener("error",(e)=>{
					console.error("cleanupClothGroup error:",req.error);
					tr.abort();
					callback(false);
				});
			}
		});
		req.addEventListener("error",(e)=>{
			console.error("cleanupClothGroup error:",req.error);
			tr.abort();
			callback(false);
		});

	}
	//cloth
	getCloth(id:number,callback:(result:ClothDoc)=>void):void{
		var tr=this.db.transaction("cloth","readonly");
		var cloth=tr.objectStore("cloth");
		var req:IDBRequest=cloth.get(id);
		req.addEventListener("success",(e)=>{
			callback(<ClothDoc>req.result);
		});
		req.addEventListener("error",(e)=>{
			console.error("getCloth error:",req.error);
			callback(null);
		});
		delete req;
	}
	setCloth(doc:ClothDoc,callback:(result:number)=>void):void{
		var tr=this.db.transaction("cloth","readwrite");
		var cloth=tr.objectStore("cloth");
		var req:IDBRequest=cloth.put(doc);
		req.addEventListener("success",(e)=>{
			setTimeout(()=>{
				callback(req.result);
			},0);
		});
		req.addEventListener("error",(e)=>{
			console.error("getCloth error:",req.error);
			callback(null);
		});
		delete req;
	}
	eachCloth(cond:{
		keyrange?:any;
		type?:string;
		group?:number;
		status?:string;
	},callback:(result:ClothDoc)=>void):void{
		var tr=this.db.transaction("cloth","readonly");
		var cloth=tr.objectStore("cloth");
		var req:IDBRequest;
		if(cond.type!=null){
			req=cloth.index("type").openCursor(<any>cond.type,"next");
		}else if(cond.group!=null){
			req=cloth.index("group").openCursor(<any>cond.group,"next");
		}else if(cond.status!=null){
			req=cloth.index("status").openCursor(<any>cond.status,"next");
		}else{
			//keyrange: nullable
			req=cloth.openCursor(cond.keyrange||null,"next");
		}
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
				callback(<ClothDoc>cursor.value);
				cursor.advance(1);
			}
		});
		req.addEventListener("error",(e)=>{
			console.error("eachCloth error:",req.error);
			callback(null);
		});
		delete req;
	}
}

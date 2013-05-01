/* some additional definitions */
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
class Cloth{
	private clothType:string=null;	//服の形
	private patterns:{
		type:string;
		colors:string[];
	}[]=[];		//パターンたち（どのパターン番号がどの部分にあたるかは服による）
	private svg:SVGSVGElement=null;

	static svgNS="http://www.w3.org/2000/svg";

	//JSON的なobjから作る
	importCloth(obj:any):void{
		this.clothType = obj.clothType || null;
		this.patterns = Array.isArray(obj.pattenrs) ? obj.patterns : [];
	}
	static importCloth(obj:any):Cloth{
		var c=new Cloth();
		c.importCloth(obj);
		return c;
	}
	//出す
	exportCloth():any{
		return {
			clothType:this.clothType,
			patterns:this.patterns,
		};
	}
	//SVG要素を出力
	getSVG(width?:string="256px",height?:string="256px"):SVGSVGElement{
		var svg:SVGSVGElement;
		if(this.svg){
			svg=<SVGSVGElement>this.svg.cloneNode();
		}else{
			//svgを作る
			svg=this.svg=<SVGSVGElement>document.createElementNS(Cloth.svgNS,"svg");
			svg.setAttribute("version","1.1");
			svg.viewBox.baseVal.x=0, svg.viewBox.baseVal.y=0, svg.viewBox.baseVal.width=256, svg.viewBox.baseVal.height=256;
			this.makeCloth(svg);
		}
		//幅設定
		svg.width.baseVal.valueAsString=width;
		svg.height.baseVal.valueAsString=height;

		this.setStyle(svg);
		return svg;
	}
	//服をつくる
	private makeCloth(el:SVGSVGElement):void{
		var type=this.clothType;
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
					path.className.baseVal="color0";
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
					path.className.baseVal="color1";
				}));
				break;
		}

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
	}
	private setStyle(el:SVGSVGElement):void{
		//まずstyleを作る
		/*
		var result:any=null;
		var d=<XPathEvaluator>document;
		var nsr=d.createNSResolver(el);
		for(var i=0,l=colors.length;i<l;i++){
			//該当するやつを探す
			result=<any>d.evaluate("/descendant-or-self::*[@class='color"+i+"']",el,nsr,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,result);
			for(var j=0,m=result.snapshotLength;j<m;j++){
				result.snapshotItem(j).setAttribute("fill",colors[i]);
			}
		}*/
	}
}


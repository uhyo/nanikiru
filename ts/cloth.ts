/* ui.tsから */
//分離してる的な!
interface PatternObj{
	type:string;
	size:number;
	colors:string[];
}
interface _SVGSomeBox extends SVGElement{
	x:SVGAnimatedLength;
	y:SVGAnimatedLength;
	width:SVGAnimatedLength;
	height:SVGAnimatedLength;
}
declare function svg(name:string,callback?:(g:SVGElement)=>void):SVGElement;
declare function path(d:string,v:{
	fill?:string;
	stroke?:string;
	sw?:number;
	slj?:string;
},callback?:(pp:SVGPathElement)=>void):SVGPathElement;
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
			type:"UT-shirt",
			patternNumber:2,
		},
		{
			type:"VT-shirt",
			patternNumber:2,
		},
		{
			type:"TT-shirt",
			patternNumber:1,
		},
		{
			type:"Polo-shirt",
			patternNumber:3,
		},
		{
			type:"Y-shirt",
			patternNumber:4,
		},
		{
			type:"U-shirt",
			patternNumber:2,
		},
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
			case "UT-shirt":
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
			//セーター的な
			case "U-shirt":
				//パス:左下から
				d=[
				"M70,53",	//袖の端からスタート
				"L90,40",	//襟のところへ
				"A80,70 0 0,0 166,40",//襟の上
				//"L246,90",	//逆の袖の端へ
				//"L216,138",	//袖口
				//"L184,118",	//脇
				"L186,53",
				"C226,90 226,180 226,240",	//袖
				"L190,240",	//袖口
				"L184,118",	//脇
				"L184,246",	//下へ
				"L72,246",	//反対側へ
				"L72,118",	//上へ
				//"L40,138",	//袖口
				"L66,240",
				"L30,240",	//袖口
				"C30,180 30,90 70,53",	//袖
				"Z",
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
			//VネックのTシャツ
			case "VT-shirt":
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
				"L128,80",
				//"A74,250 0 0,1 90,40",//下のえり
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
			//タートルネックのTシャツ
			case "TT-shirt":
				//パス:左下から
				d=[
				"M10,90",	//袖の端からスタート
				"L90,40",	//襟のところへ
				//"A80,70 0 0,0 166,40",//襟の上
				"L90,10",	//タートルネック
				"L166,10",
				"L166,40",
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
				break;
			case "Polo-shirt":
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
				//中の部分
				d=[
				"M90,40",	//襟のところ
				"L166,40",
				"L128,60",
				"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
					slj:"bevel",
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(1)+")");
				}));
				//襟1
				d=[
				"M98,20",
				"L158,20",
				"L166,40",
				"L90,40",
				"Z",
				].join(" ");
				var pt2=makePattern(2);
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
					slj:"bevel",
				},(path)=>{
					path.setAttribute("fill","url(#"+pt2+")");
				}));
				//襟2
				d=[
				"M90,40",	//襟のところ
				"L106,80",
				"L128,60",
				"L150,80",
				"L166,40",	//下ここまで
				"L158,20",
				"L128,56",
				"L98,20",
				"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
					slj:"bevel",
				},(path)=>{
					path.setAttribute("fill","url(#"+pt2+")");
				}));
				break;
			case "Y-shirt":
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
				//中の部分
				d=[
				"M90,40",	//襟のところ
				"L166,40",
				"L128,60",
				"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
					slj:"bevel",
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(1)+")");
				}));
				//襟1
				d=[
				"M98,20",
				"L158,20",
				"L166,40",
				"L90,40",
				"Z",
				].join(" ");
				var pt2=makePattern(2);
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
					slj:"bevel",
				},(path)=>{
					path.setAttribute("fill","url(#"+pt2+")");
				}));
				//襟2
				d=[
				"M90,40",	//襟のところ
				"L106,80",
				"L128,60",
				"L150,80",
				"L166,40",	//下ここまで
				"L158,20",
				"L128,56",
				"L98,20",
				"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
					slj:"bevel",
				},(path)=>{
					path.setAttribute("fill","url(#"+pt2+")");
				}));
				var pt3=makePattern(3);
				//ボタン
				for(var i=0;i<5;i++){
					el.appendChild(svg("circle",(c)=>{
						var circle=<SVGCircleElement>c;
						circle.cx.baseVal.valueAsString="128px";
						circle.cy.baseVal.valueAsString=(90+30*i)+"px";
						circle.setAttribute("fill","url(#"+pt3+")");
						circle.setAttribute("stroke","#000000");
						circle.setAttribute("stroke-width","1px");
						circle.r.baseVal.valueAsString="5px";
					}));
				}
				//区切り線
				for(var i=0;i<2;i++){
					el.appendChild(svg("line",(l)=>{
						var line=<SVGLineElement>l;
						line.x1.baseVal.valueAsString=(128+(i*2-1)*8)+"px";
						line.x2.baseVal.valueAsString=(128+(i*2-1)*8)+"px";
						line.y1.baseVal.valueAsString="70px";
						line.y2.baseVal.valueAsString="240px";
						line.setAttribute("stroke","#000000");
						line.setAttribute("opacity","0.6");
						line.setAttribute("stroke-width","2px");
					}));
				}
				break;
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

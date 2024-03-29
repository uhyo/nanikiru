///<reference path="def.ts"/>
/* ui.tsから */
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
		//トップス
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
			type:"YT-shirt",
			patternNumber:4,
		},
		{
			type:"U-shirt",
			patternNumber:2,
		},
		{
			type:"V-shirt",
			patternNumber:2,
		},
		{
			type:"Tl-shirt",
			patternNumber:1,
		},
		{
			type:"Long-shirt",
			patternNumber:3,
		},
		{
			type:"Yc-shirt",
			patternNumber:4,
		},
		{
			type:"Y-shirt",
			patternNumber:4,
		},
		{
			type:"Tanktop",
			patternNumber:1,
		},
		{
			type:"Camisole",
			patternNumber:1,
		},
		{
			type:"Jacket",
			patternNumber:4,
		},
		/* Bototms */
		{
			type:"Slacks",
			patternNumber:1,
		},
		{
			type:"B-Slacks",
			patternNumber:2,
		},
		{
			type:"Chino",
			patternNumber:1,
		},
		{
			type:"Halfpants",
			patternNumber:1,
		},
		{
			type:"Hotpants",
			patternNumber:1,
		},
		{
			type:"M-Skirt",
			patternNumber:1,
		},
		{
			type:"Skirt",
			patternNumber:1,
		},
		{
			type:"L-Skirt",
			patternNumber:1,
		},
		/* overall */
		{
			type:"Suit",
			patternNumber:2,
		},
		{
			type:"Onepiece",
			patternNumber:2,
		},
		/* socks */
		{
			type:"Socks",
			patternNumber:1,
		},
		{
			type:"L-Socks",
			patternNumber:1,
		},
		{
			type:"S-Socks",
			patternNumber:1,
		},
		/* neckties */
		{
			type:"Necktie",
			patternNumber:1,
		},
		{
			type:"B-Necktie",
			patternNumber:1,
		},
	];
	//服のデフォルト色
	static defaultColors:string[]=["#666666","#cccccc","#eeeeee","#999999","#333333"];
	//パターンの種類と要求色数
	static patternTypes:{
		type:string;	//パターン名
		requiresSize:bool;
		requiresDeg:bool;
		defaultSize:number;
		colorNumber:number;
	}[]=[
		{
			type:"simple",
			requiresSize:false,
			requiresDeg:false,
			defaultSize:0,
			colorNumber:1,
		},
		{
			type:"2-check",
			requiresSize:true,
			requiresDeg:true,
			defaultSize:20,
			colorNumber:2,
		},
		{
			type:"4-check",
			requiresSize:true,
			requiresDeg:true,
			defaultSize:20,
			colorNumber:4,
		},
		{
			type:"2-stripe",
			requiresSize:true,
			requiresDeg:true,
			defaultSize:20,
			colorNumber:2,
		},
		{
			type:"3-stripe",
			requiresSize:true,
			requiresDeg:true,
			defaultSize:20,
			colorNumber:3,
		},
		{
			type:"4-stripe",
			requiresSize:true,
			requiresDeg:true,
			defaultSize:20,
			colorNumber:4,
		},
		{
			type:"2-dot",
			requiresSize:true,
			requiresDeg:true,
			defaultSize:10,
			colorNumber:2,
		},
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
			//Vロング
			case "V-shirt":
				//パス:左下から
				d=[
				"M70,53",	//袖の端からスタート
				"L90,40",	//襟のところへ
				"A80,70 0 0,0 166,40",//襟の上
				"L186,53",
				"C226,90 226,180 226,240",	//袖
				"L190,240",	//袖口
				"L184,118",	//脇
				"L184,246",	//下へ
				"L72,246",	//反対側へ
				"L72,118",	//上へ
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
			//タートルネックのロングシャツ
			case "Tl-shirt":
				//パス:左下から
				d=[
				"M70,53",	//袖の端からスタート
				"L90,40",	//襟のところへ
				//"A80,70 0 0,0 166,40",//襟の上
				"L90,10",	//タートルネック
				"L166,10",
				"L166,40",
				"L186,53",
				"C226,90 226,180 226,240",	//袖
				"L190,240",	//袖口
				"L184,118",	//脇
				"L184,246",	//下へ
				"L72,246",	//反対側へ
				"L72,118",	//上へ
				"L66,240",
				"L30,240",	//袖口
				"C30,180 30,90 70,53",	//袖
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
			case "Long-shirt":
				d=[
				"M70,53",	//袖の端からスタート
				"L90,40",	//襟のところへ
				"A80,70 0 0,0 166,40",//襟の上
				"L186,53",
				"C226,90 226,180 226,240",	//袖
				"L190,240",	//袖口
				"L184,118",	//脇
				"L184,246",	//下へ
				"L72,246",	//反対側へ
				"L72,118",	//上へ
				"L66,240",
				"L30,240",	//袖口
				"C30,180 30,90 70,53",	//袖
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
			case "Jacket":
				d=[
				"M70,53",	//袖の端からスタート
				"L90,40",	//襟のところへ
				"A80,70 0 0,0 166,40",//襟の上
				"L186,53",
				"C226,90 226,180 226,240",	//袖
				"L190,240",	//袖口
				"L184,118",	//脇
				"L184,246",	//下へ
				"L136,252",	//途中で
				"L136,50",	//上に隠れる
				"L120,50",
				"L120,252",
				"L72,246",	//反対側へ
				"L72,118",	//上へ
				"L66,240",
				"L30,240",	//袖口
				"C30,180 30,90 70,53",	//袖
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
				"M120,50",	//間から見えるところ
				"L136,50",
				"L136,246",
				"L120,246",
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
			case "YT-shirt":
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
			case "Yc-shirt":
				d=[
				"M70,53",	//袖の端からスタート
				"L90,40",	//襟のところへ
				"A80,70 0 0,0 166,40",//襟の上
				"L186,53",
				"C226,90 226,180 226,240",	//袖
				"L190,240",	//袖口
				"L184,118",	//脇
				"L184,246",	//下へ
				"L72,246",	//反対側へ
				"L72,118",	//上へ
				"L66,240",
				"L30,240",	//袖口
				"C30,180 30,90 70,53",	//袖
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
			case "Y-shirt":
				d=[
				"M30,77.5",	//袖の端からスタート
				"L90,40",	//襟のところへ
				"A80,70 0 0,0 166,40",//襟の上
				//"C226,90 226,180 226,240",	//袖
				"L226,77.5",
				"L226,240",
				"L190,240",	//袖口
				"L184,118",	//脇
				"L184,246",	//下へ
				"L72,246",	//反対側へ
				"L72,118",	//上へ
				"L66,240",
				"L30,240",	//袖口
				//"C30,180 30,90 70,53",	//袖
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
			//タンクトップ
			case "Tanktop":
				//パス:左下から
				d=[
				"M70,40",	//左上
				"L90,40",
				"A48,120 0 0,0 166,40",//襟の上
				"L186,40",
				"A30,100 0 0,0 216,140",	//わき?
				"L216,246",	//下へ
				"L40,246",	//反対側へ
				"L40,140",	//上へ
				"A30,100 0 0,0 70,40",
				"Z",	//袖口
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			//キャミソール
			case "Camisole":
				d=[
				"M80,40",	//左上
				"L90,40",
				"L90,80",
				"A48,40 0 0,0 166,80",//襟の上
				"L166,40",
				"L176,40",
				"A40,100 0 0,0 216,140",	//わき?
				"L216,246",	//下へ
				"L40,246",	//反対側へ
				"L40,140",	//上へ
				"A40,100 0 0,0 80,40",
				"Z",	//袖口
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			case "Slacks":
				d=[
					"M66,40",	//上
					"L190,40",
					"L200,246",	//足
					"L135,246",	//すそ
					"L128,101.8",	//股
					"L121,246",
					"L56,246",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			//ベルト付き
			case "B-Slacks":
				d=[
					"M66,40",	//上
					"L190,40",
					"L200,246",	//足
					"L135,246",	//すそ
					"L128,101.8",	//股
					"L121,246",
					"L56,246",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				d=[
					"M65.5,50.3",	//左上
					"L190.5,50.3",
					"L191.5,70.9",
					"L64.5,70.9",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(1)+")");
				}));
				break;
			case "Chino":
				d=[
					"M66,40",	//上
					"L190,40",
					"L200,246",	//足
					"L135,246",	//すそ
					"L128,101.8",	//股
					"L121,246",
					"L56,246",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				//ポケットの線(右)
				d=[
					"M193,101.8",
					"L154.6,101.8",
					"L157.6,163.6",
					"L196,163.6",
					"M154.6,101.8",
					"L163.6,122.4",
					"L194,122.4",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				}));
				//ポケットの線(左)
				d=[
					"M63,101.8",
					"L102.4,101.8",
					"L99.4,163.6",
					"L60,163.6",
					"M102.4,101.8",
					"L93.4,122.4",
					"L62,122.4",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				}));
				break;
			case "Halfpants":
				d=[
					"M66,40",	//上
					"L190,40",
					"L196,163.6",	//足
					"L131,163.6",	//すそ
					"L128,101.8",	//股
					"L125,163.6",
					"L60,163.6",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			case "Hotpants":
				d=[
					"M66,40",	//上
					"L190,40",
					"L194,122.4",	//足
					"L129,122.4",	//すそ
					"L128,101.8",	//股
					"L127,122.4",
					"L62,122.4",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			case "Skirt":
				d=[
					"M81,40",	//上
					"L175,40",
					"L206,163.6",	//足
					"L46,163.6",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			case "M-Skirt":
				d=[
					"M81,40",	//上
					"L175,40",
					"L206,103",	//足
					"L46,103",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			case "L-Skirt":
				d=[
					"M81,40",	//上
					"L175,40",
					"L206,240",	//足
					"L46,240",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			case "Suit":
				d=[
				//左
				"M70,53",	//袖の端からスタート
				"L90,40",	//襟のところへ
				//"A80,70 0 0,0 166,40",//襟の上
				"L128,160",
				"L128,252",
				"L72,246",	//反対側へ
				"L72,118",	//上へ
				"L66,240",
				"L30,240",	//袖口
				"C30,180 30,90 70,53",	//袖
				"Z",	//袖口
				//右
				"M166,40",
				"L186,53",
				"C226,90 226,180 226,240",	//袖
				"L190,240",	//袖口
				"L184,118",	//脇
				"L184,246",	//下へ
				"L128,252",	//途中で
				"L128,160",
				"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				//襟
				d=[
				//左側
				"M70,53",	//袖の端からスタート
				"L90,40",	//襟のところへ
				"L128,160",
				"L70,80",
				"L84,60",
				"L74,54",
				"Z",
				//右
				"M186,53",
				"L166,40",
				"L128,160",
				"L186,80",
				"L172,60",
				"L182,54",
				"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				//中の部分
				d=[
				"M90,40",
				"L166,40",
				"L128,160",
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
			case "Onepiece":
				d=[
				"M10,60",	//袖の端からスタート
				"L90,10",	//襟のところへ
				"A74,250 0 0,0 166,10",//下のえり
				"L246,60",	//逆の袖の端へ
				"L216,108",	//袖口
				"L184,88",	//脇
				"L184,126",	//下へ
				//下の部分
				"L226,246",
				"L30,246",
				"L72,126",	//反対側へ
				"L72,88",	//上へ
				"L40,108",	//袖口
				"Z",	//袖口
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			case "Socks":
				/*d=[
					"M100,40",
					"L140,40",
					"L140,120",
					"L120,140",
					"A40,20 -45 0,1 91.6,111.6",
					"L100,103.2",
					"Z",
				].join(" ");*/
				d=[
					"M100,40",
					"L160,40",
					"L160,160",
					"L130,190",
					"A60,30 -45 0,1 87.4,147.4",
					"L100,134.8",
					"Z",
				].join(" ");
				el.appendChild(svg("g",(g)=>{
					g.appendChild(path(d,{
						stroke:"#000000",
						sw:5,
					},(path)=>{
						path.setAttribute("fill","url(#"+makePattern(0)+")");
					}));
				}));
				el.appendChild(svg("g",(g)=>{
					g.setAttribute("transform","translate(50,20)");
					g.appendChild(path(d,{
						stroke:"#000000",
						sw:5,
					},(path)=>{
						path.setAttribute("fill","url(#"+makePattern(0)+")");
					}));
				}));
				break;
			case "L-Socks":
				d=[
					"M100,40",
					"L140,40",
					"L140,170",
					"L120,190",
					"A40,20 -45 0,1 91.6,161.6",
					"L100,153.2",
					"Z",
				].join(" ");
				el.appendChild(svg("g",(g)=>{
					g.appendChild(path(d,{
						stroke:"#000000",
						sw:5,
					},(path)=>{
						path.setAttribute("fill","url(#"+makePattern(0)+")");
					}));
				}));
				el.appendChild(svg("g",(g)=>{
					g.setAttribute("transform","translate(30,20)");
					g.appendChild(path(d,{
						stroke:"#000000",
						sw:5,
					},(path)=>{
						path.setAttribute("fill","url(#"+makePattern(0)+")");
					}));
				}));
				break;
			case "S-Socks":
				d=[
					"M100,120",
					"L160,120",
					"L160,160",
					"L130,190",
					"A60,30 -45 0,1 87.4,147.4",
					"L100,134.8",
					"Z",
				].join(" ");
				el.appendChild(svg("g",(g)=>{
					g.appendChild(path(d,{
						stroke:"#000000",
						sw:5,
					},(path)=>{
						path.setAttribute("fill","url(#"+makePattern(0)+")");
					}));
				}));
				el.appendChild(svg("g",(g)=>{
					g.setAttribute("transform","translate(50,20)");
					g.appendChild(path(d,{
						stroke:"#000000",
						sw:5,
					},(path)=>{
						path.setAttribute("fill","url(#"+makePattern(0)+")");
					}));
				}));
				break;
			case "Necktie":
				d=[
					//結び目
					"M90,40",
					"L166,40",
					"L148,70",
					"L108,70",
					"Z",
					"M148,70",
					"L166,220",
					"L128,252",
					"L90,220",
					"L108,70",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				break;
			case "B-Necktie":
				d=[
					"M100,100",
					"L156,100",
					"L200,70",
					"L200,186",
					"L156,156",
					"L100,156",
					"L56,186",
					"L56,70",
					"Z",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				},(path)=>{
					path.setAttribute("fill","url(#"+makePattern(0)+")");
				}));
				//丸い部分
				d=[
					"M156,100",
					"A80,100 0 0,1 156,156",
					"M100,100",
					"A80,100 0 0,0 100,156",
				].join(" ");
				el.appendChild(path(d,{
					stroke:"#000000",
					sw:5,
				}));
				break;
		}

		function makePattern(index:number):string{
			//パターンを作ってあげる idを返す
			var pat:PatternObj=patterns[index];
			if(!pat){
				//足りない!!!!!!!!
				pat={
					type:"simple",
					size:0,
					deg:0,
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
		pattern.setAttribute("patternUnits","userSpaceOnUse");
		var size=pat.size;
		//タイプごと
		switch(pat.type){
			case "simple":
				//単色
				setwh(pattern,0,0,256,256);
				setvb(pattern.viewBox,0,0,256,256);
				//その色でうめる
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,0,256,256);
					rect.setAttribute("fill",pat.colors[0]);
				}));
				break;
			case "2-check":
				//2色チェック
				setwh(pattern,0,0,size*2,size*2);
				setvb(pattern.viewBox,0,0,size*2,size*2);
				//2色交互
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,0,size,size);
					rect.setAttribute("fill",pat.colors[0]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,size,size,size,size);
					rect.setAttribute("fill",pat.colors[0]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,size,0,size,size);
					rect.setAttribute("fill",pat.colors[1]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,size,size,size);
					rect.setAttribute("fill",pat.colors[1]);
				}));
				break;
			case "4-check":
				//4色チェック
				setwh(pattern,0,0,size*2,size*2);
				setvb(pattern.viewBox,0,0,size*2,size*2);
				//2色交互
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,0,size,size);
					rect.setAttribute("fill",pat.colors[0]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,size,size,size,size);
					rect.setAttribute("fill",pat.colors[2]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,size,0,size,size);
					rect.setAttribute("fill",pat.colors[1]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,size,size,size);
					rect.setAttribute("fill",pat.colors[3]);
				}));
				break;
			case "2-stripe":
				//2色ストライプ
				setwh(pattern,0,0,256,size*2);
				setvb(pattern.viewBox,0,0,256,size*2);
				//2色交互
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,0,256,size);
					rect.setAttribute("fill",pat.colors[0]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,size,256,size);
					rect.setAttribute("fill",pat.colors[1]);
				}));
				break;
			case "3-stripe":
				//3色ストライプ
				setwh(pattern,0,0,256,size*3);
				setvb(pattern.viewBox,0,0,256,size*3);
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,0,256,size);
					rect.setAttribute("fill",pat.colors[0]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,size,256,size);
					rect.setAttribute("fill",pat.colors[1]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,size*2,256,size);
					rect.setAttribute("fill",pat.colors[2]);
				}));
				break;
			case "4-stripe":
				//4色ストライプ
				setwh(pattern,0,0,256,size*4);
				setvb(pattern.viewBox,0,0,256,size*4);
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,0,256,size);
					rect.setAttribute("fill",pat.colors[0]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,size,256,size);
					rect.setAttribute("fill",pat.colors[1]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,size*2,256,size);
					rect.setAttribute("fill",pat.colors[2]);
				}));
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,size*3,256,size);
					rect.setAttribute("fill",pat.colors[3]);
				}));
				break;
			case "2-dot":
				//2色水玉
				setwh(pattern,0,0,size*6,size*6);
				setvb(pattern.viewBox,0,0,size*6,size*6);
				//背景色
				pattern.appendChild(svg("rect",(r)=>{
					var rect=<SVGRectElement>r;
					setwh(rect,0,0,size*6,size*6);
					rect.setAttribute("fill",pat.colors[0]);
				}));
				//チェックの位置に水玉
				pattern.appendChild(svg("circle",(c)=>{
					var circle=<SVGCircleElement>c;
					circle.setAttribute("cx",String(size*1.5));
					circle.setAttribute("cy",String(size*1.5));
					circle.setAttribute("r",String(size));
					circle.setAttribute("fill",pat.colors[1]);
				}));
				pattern.appendChild(svg("circle",(c)=>{
					var circle=<SVGCircleElement>c;
					circle.setAttribute("cx",String(size*4.5));
					circle.setAttribute("cy",String(size*4.5));
					circle.setAttribute("r",String(size));
					circle.setAttribute("fill",pat.colors[1]);
				}));
				break;
		}
		//角度調整
		if(pat.deg){
			pattern.setAttribute("patternTransform","rotate("+pat.deg+")");
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


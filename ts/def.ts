/* ui.ts, cloth.ts, db.ts */
interface PatternObj{
	type:string;
	size:number;
	deg:number;
	colors:string[];
}
/* 便宜的にあってほしいやつ ダックタイピング最高 */
interface _SVGSomeBox extends SVGElement{
	x:SVGAnimatedLength;
	y:SVGAnimatedLength;
	width:SVGAnimatedLength;
	height:SVGAnimatedLength;
}



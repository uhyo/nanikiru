var Cloth = (function () {
    function Cloth() {
        this.clothType = null;
        this.patterns = [];
    }
    Cloth.svgNS = "http://www.w3.org/2000/svg";
    Cloth.clothId = 0;
    Cloth.clothTypes = [
        {
            type: "UT-shirt",
            patternNumber: 2
        }, 
        {
            type: "VT-shirt",
            patternNumber: 2
        }, 
        {
            type: "TT-shirt",
            patternNumber: 1
        }, 
        {
            type: "Polo-shirt",
            patternNumber: 3
        }, 
        {
            type: "YT-shirt",
            patternNumber: 4
        }, 
        {
            type: "U-shirt",
            patternNumber: 2
        }, 
        {
            type: "V-shirt",
            patternNumber: 2
        }, 
        {
            type: "Tl-shirt",
            patternNumber: 1
        }, 
        {
            type: "Long-shirt",
            patternNumber: 3
        }, 
        {
            type: "Yc-shirt",
            patternNumber: 4
        }, 
        {
            type: "Y-shirt",
            patternNumber: 4
        }, 
        {
            type: "Tanktop",
            patternNumber: 1
        }, 
        {
            type: "Camisole",
            patternNumber: 1
        }, 
        {
            type: "Jacket",
            patternNumber: 4
        }, 
        {
            type: "Slacks",
            patternNumber: 1
        }, 
        {
            type: "B-Slacks",
            patternNumber: 2
        }, 
        {
            type: "Chino",
            patternNumber: 1
        }, 
        {
            type: "Halfpants",
            patternNumber: 1
        }, 
        {
            type: "Hotpants",
            patternNumber: 1
        }, 
        {
            type: "M-Skirt",
            patternNumber: 1
        }, 
        {
            type: "Skirt",
            patternNumber: 1
        }, 
        {
            type: "L-Skirt",
            patternNumber: 1
        }, 
        {
            type: "Suit",
            patternNumber: 2
        }, 
        {
            type: "Onepiece",
            patternNumber: 2
        }, 
        {
            type: "Socks",
            patternNumber: 1
        }, 
        {
            type: "L-Socks",
            patternNumber: 1
        }, 
        {
            type: "S-Socks",
            patternNumber: 1
        }, 
        {
            type: "Necktie",
            patternNumber: 1
        }, 
        {
            type: "B-Necktie",
            patternNumber: 1
        }, 
        
    ];
    Cloth.defaultColors = [
        "#666666", 
        "#cccccc", 
        "#eeeeee", 
        "#999999", 
        "#333333"
    ];
    Cloth.patternTypes = [
        {
            type: "simple",
            requiresSize: false,
            requiresDeg: false,
            defaultSize: 0,
            colorNumber: 1
        }, 
        {
            type: "2-check",
            requiresSize: true,
            requiresDeg: true,
            defaultSize: 20,
            colorNumber: 2
        }, 
        {
            type: "4-check",
            requiresSize: true,
            requiresDeg: true,
            defaultSize: 20,
            colorNumber: 4
        }, 
        {
            type: "2-stripe",
            requiresSize: true,
            requiresDeg: true,
            defaultSize: 20,
            colorNumber: 2
        }, 
        {
            type: "3-stripe",
            requiresSize: true,
            requiresDeg: true,
            defaultSize: 20,
            colorNumber: 3
        }, 
        {
            type: "4-stripe",
            requiresSize: true,
            requiresDeg: true,
            defaultSize: 20,
            colorNumber: 4
        }, 
        {
            type: "2-dot",
            requiresSize: true,
            requiresDeg: true,
            defaultSize: 10,
            colorNumber: 2
        }, 
        
    ];
    Cloth.prototype.importCloth = function (obj) {
        this.clothType = obj.type || null;
        this.patterns = Array.isArray(obj.patterns) ? obj.patterns : [];
    };
    Cloth.importCloth = function importCloth(obj) {
        var c = new Cloth();
        c.importCloth(obj);
        return c;
    };
    Cloth.prototype.exportCloth = function () {
        return {
            type: this.clothType,
            patterns: this.patterns
        };
    };
    Cloth.prototype.getSVG = function (width, height) {
        if (typeof width === "undefined") { width = "256px"; }
        if (typeof height === "undefined") { height = "256px"; }
        var svg;
        svg = document.createElementNS(Cloth.svgNS, "svg");
        svg.setAttribute("version", "1.1");
        svg.viewBox.baseVal.x = 0 , svg.viewBox.baseVal.y = 0 , svg.viewBox.baseVal.width = 256 , svg.viewBox.baseVal.height = 256;
        svg.id = "cloth" + (Cloth.clothId++);
        this.makeCloth(svg);
        svg.width.baseVal.valueAsString = width;
        svg.height.baseVal.valueAsString = height;
        return svg;
    };
    Cloth.prototype.makeCloth = function (el) {
        var type = this.clothType, patterns = this.patterns;
        var defs = svg("defs");
        el.appendChild(defs);
        var d;
        switch(type) {
            case "UT-shirt":
                d = [
                    "M10,90", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L246,90", 
                    "L216,138", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L40,138", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "A80,70 0 0,0 166,40", 
                    "A74,250 0 0,1 90,40", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                break;
            case "U-shirt":
                d = [
                    "M70,53", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L186,53", 
                    "C226,90 226,180 226,240", 
                    "L190,240", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L66,240", 
                    "L30,240", 
                    "C30,180 30,90 70,53", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "A80,70 0 0,0 166,40", 
                    "A74,250 0 0,1 90,40", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                break;
            case "VT-shirt":
                d = [
                    "M10,90", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L246,90", 
                    "L216,138", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L40,138", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L128,80", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                break;
            case "V-shirt":
                d = [
                    "M70,53", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L186,53", 
                    "C226,90 226,180 226,240", 
                    "L190,240", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L66,240", 
                    "L30,240", 
                    "C30,180 30,90 70,53", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L128,80", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                break;
            case "TT-shirt":
                d = [
                    "M10,90", 
                    "L90,40", 
                    "L90,10", 
                    "L166,10", 
                    "L166,40", 
                    "L246,90", 
                    "L216,138", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L40,138", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "Tl-shirt":
                d = [
                    "M70,53", 
                    "L90,40", 
                    "L90,10", 
                    "L166,10", 
                    "L166,40", 
                    "L186,53", 
                    "C226,90 226,180 226,240", 
                    "L190,240", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L66,240", 
                    "L30,240", 
                    "C30,180 30,90 70,53", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "Polo-shirt":
                d = [
                    "M10,90", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L246,90", 
                    "L216,138", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L40,138", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "L166,40", 
                    "L128,60", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                d = [
                    "M98,20", 
                    "L158,20", 
                    "L166,40", 
                    "L90,40", 
                    "Z", 
                    
                ].join(" ");
                var pt2 = makePattern(2);
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                d = [
                    "M90,40", 
                    "L106,80", 
                    "L128,60", 
                    "L150,80", 
                    "L166,40", 
                    "L158,20", 
                    "L128,56", 
                    "L98,20", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                break;
            case "Long-shirt":
                d = [
                    "M70,53", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L186,53", 
                    "C226,90 226,180 226,240", 
                    "L190,240", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L66,240", 
                    "L30,240", 
                    "C30,180 30,90 70,53", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "L166,40", 
                    "L128,60", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                d = [
                    "M98,20", 
                    "L158,20", 
                    "L166,40", 
                    "L90,40", 
                    "Z", 
                    
                ].join(" ");
                var pt2 = makePattern(2);
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                d = [
                    "M90,40", 
                    "L106,80", 
                    "L128,60", 
                    "L150,80", 
                    "L166,40", 
                    "L158,20", 
                    "L128,56", 
                    "L98,20", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                break;
            case "Jacket":
                d = [
                    "M70,53", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L186,53", 
                    "C226,90 226,180 226,240", 
                    "L190,240", 
                    "L184,118", 
                    "L184,246", 
                    "L136,252", 
                    "L136,50", 
                    "L120,50", 
                    "L120,252", 
                    "L72,246", 
                    "L72,118", 
                    "L66,240", 
                    "L30,240", 
                    "C30,180 30,90 70,53", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "L166,40", 
                    "L128,60", 
                    "Z", 
                    "M120,50", 
                    "L136,50", 
                    "L136,246", 
                    "L120,246", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                d = [
                    "M98,20", 
                    "L158,20", 
                    "L166,40", 
                    "L90,40", 
                    "Z", 
                    
                ].join(" ");
                var pt2 = makePattern(2);
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                d = [
                    "M90,40", 
                    "L106,80", 
                    "L128,60", 
                    "L150,80", 
                    "L166,40", 
                    "L158,20", 
                    "L128,56", 
                    "L98,20", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                break;
            case "YT-shirt":
                d = [
                    "M10,90", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L246,90", 
                    "L216,138", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L40,138", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "L166,40", 
                    "L128,60", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                d = [
                    "M98,20", 
                    "L158,20", 
                    "L166,40", 
                    "L90,40", 
                    "Z", 
                    
                ].join(" ");
                var pt2 = makePattern(2);
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                d = [
                    "M90,40", 
                    "L106,80", 
                    "L128,60", 
                    "L150,80", 
                    "L166,40", 
                    "L158,20", 
                    "L128,56", 
                    "L98,20", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                var pt3 = makePattern(3);
                for(var i = 0; i < 5; i++) {
                    el.appendChild(svg("circle", function (c) {
                        var circle = c;
                        circle.cx.baseVal.valueAsString = "128px";
                        circle.cy.baseVal.valueAsString = (90 + 30 * i) + "px";
                        circle.setAttribute("fill", "url(#" + pt3 + ")");
                        circle.setAttribute("stroke", "#000000");
                        circle.setAttribute("stroke-width", "1px");
                        circle.r.baseVal.valueAsString = "5px";
                    }));
                }
                for(var i = 0; i < 2; i++) {
                    el.appendChild(svg("line", function (l) {
                        var line = l;
                        line.x1.baseVal.valueAsString = (128 + (i * 2 - 1) * 8) + "px";
                        line.x2.baseVal.valueAsString = (128 + (i * 2 - 1) * 8) + "px";
                        line.y1.baseVal.valueAsString = "70px";
                        line.y2.baseVal.valueAsString = "240px";
                        line.setAttribute("stroke", "#000000");
                        line.setAttribute("opacity", "0.6");
                        line.setAttribute("stroke-width", "2px");
                    }));
                }
                break;
            case "Yc-shirt":
                d = [
                    "M70,53", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L186,53", 
                    "C226,90 226,180 226,240", 
                    "L190,240", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L66,240", 
                    "L30,240", 
                    "C30,180 30,90 70,53", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "L166,40", 
                    "L128,60", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                d = [
                    "M98,20", 
                    "L158,20", 
                    "L166,40", 
                    "L90,40", 
                    "Z", 
                    
                ].join(" ");
                var pt2 = makePattern(2);
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                d = [
                    "M90,40", 
                    "L106,80", 
                    "L128,60", 
                    "L150,80", 
                    "L166,40", 
                    "L158,20", 
                    "L128,56", 
                    "L98,20", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                var pt3 = makePattern(3);
                for(var i = 0; i < 5; i++) {
                    el.appendChild(svg("circle", function (c) {
                        var circle = c;
                        circle.cx.baseVal.valueAsString = "128px";
                        circle.cy.baseVal.valueAsString = (90 + 30 * i) + "px";
                        circle.setAttribute("fill", "url(#" + pt3 + ")");
                        circle.setAttribute("stroke", "#000000");
                        circle.setAttribute("stroke-width", "1px");
                        circle.r.baseVal.valueAsString = "5px";
                    }));
                }
                for(var i = 0; i < 2; i++) {
                    el.appendChild(svg("line", function (l) {
                        var line = l;
                        line.x1.baseVal.valueAsString = (128 + (i * 2 - 1) * 8) + "px";
                        line.x2.baseVal.valueAsString = (128 + (i * 2 - 1) * 8) + "px";
                        line.y1.baseVal.valueAsString = "70px";
                        line.y2.baseVal.valueAsString = "240px";
                        line.setAttribute("stroke", "#000000");
                        line.setAttribute("opacity", "0.6");
                        line.setAttribute("stroke-width", "2px");
                    }));
                }
                break;
            case "Y-shirt":
                d = [
                    "M30,77.5", 
                    "L90,40", 
                    "A80,70 0 0,0 166,40", 
                    "L226,77.5", 
                    "L226,240", 
                    "L190,240", 
                    "L184,118", 
                    "L184,246", 
                    "L72,246", 
                    "L72,118", 
                    "L66,240", 
                    "L30,240", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "L166,40", 
                    "L128,60", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                d = [
                    "M98,20", 
                    "L158,20", 
                    "L166,40", 
                    "L90,40", 
                    "Z", 
                    
                ].join(" ");
                var pt2 = makePattern(2);
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                d = [
                    "M90,40", 
                    "L106,80", 
                    "L128,60", 
                    "L150,80", 
                    "L166,40", 
                    "L158,20", 
                    "L128,56", 
                    "L98,20", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + pt2 + ")");
                }));
                var pt3 = makePattern(3);
                for(var i = 0; i < 5; i++) {
                    el.appendChild(svg("circle", function (c) {
                        var circle = c;
                        circle.cx.baseVal.valueAsString = "128px";
                        circle.cy.baseVal.valueAsString = (90 + 30 * i) + "px";
                        circle.setAttribute("fill", "url(#" + pt3 + ")");
                        circle.setAttribute("stroke", "#000000");
                        circle.setAttribute("stroke-width", "1px");
                        circle.r.baseVal.valueAsString = "5px";
                    }));
                }
                for(var i = 0; i < 2; i++) {
                    el.appendChild(svg("line", function (l) {
                        var line = l;
                        line.x1.baseVal.valueAsString = (128 + (i * 2 - 1) * 8) + "px";
                        line.x2.baseVal.valueAsString = (128 + (i * 2 - 1) * 8) + "px";
                        line.y1.baseVal.valueAsString = "70px";
                        line.y2.baseVal.valueAsString = "240px";
                        line.setAttribute("stroke", "#000000");
                        line.setAttribute("opacity", "0.6");
                        line.setAttribute("stroke-width", "2px");
                    }));
                }
                break;
            case "Tanktop":
                d = [
                    "M70,40", 
                    "L90,40", 
                    "A48,120 0 0,0 166,40", 
                    "L186,40", 
                    "A30,100 0 0,0 216,140", 
                    "L216,246", 
                    "L40,246", 
                    "L40,140", 
                    "A30,100 0 0,0 70,40", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "Camisole":
                d = [
                    "M80,40", 
                    "L90,40", 
                    "L90,80", 
                    "A48,40 0 0,0 166,80", 
                    "L166,40", 
                    "L176,40", 
                    "A40,100 0 0,0 216,140", 
                    "L216,246", 
                    "L40,246", 
                    "L40,140", 
                    "A40,100 0 0,0 80,40", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "Slacks":
                d = [
                    "M66,40", 
                    "L190,40", 
                    "L200,246", 
                    "L135,246", 
                    "L128,101.8", 
                    "L121,246", 
                    "L56,246", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "B-Slacks":
                d = [
                    "M66,40", 
                    "L190,40", 
                    "L200,246", 
                    "L135,246", 
                    "L128,101.8", 
                    "L121,246", 
                    "L56,246", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M65.5,50.3", 
                    "L190.5,50.3", 
                    "L191.5,70.9", 
                    "L64.5,70.9", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                break;
            case "Chino":
                d = [
                    "M66,40", 
                    "L190,40", 
                    "L200,246", 
                    "L135,246", 
                    "L128,101.8", 
                    "L121,246", 
                    "L56,246", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M193,101.8", 
                    "L154.6,101.8", 
                    "L157.6,163.6", 
                    "L196,163.6", 
                    "M154.6,101.8", 
                    "L163.6,122.4", 
                    "L194,122.4", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }));
                d = [
                    "M63,101.8", 
                    "L102.4,101.8", 
                    "L99.4,163.6", 
                    "L60,163.6", 
                    "M102.4,101.8", 
                    "L93.4,122.4", 
                    "L62,122.4", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }));
                break;
            case "Halfpants":
                d = [
                    "M66,40", 
                    "L190,40", 
                    "L196,163.6", 
                    "L131,163.6", 
                    "L128,101.8", 
                    "L125,163.6", 
                    "L60,163.6", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "Hotpants":
                d = [
                    "M66,40", 
                    "L190,40", 
                    "L194,122.4", 
                    "L129,122.4", 
                    "L128,101.8", 
                    "L127,122.4", 
                    "L62,122.4", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "Skirt":
                d = [
                    "M81,40", 
                    "L175,40", 
                    "L206,163.6", 
                    "L46,163.6", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "M-Skirt":
                d = [
                    "M81,40", 
                    "L175,40", 
                    "L206,103", 
                    "L46,103", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "L-Skirt":
                d = [
                    "M81,40", 
                    "L175,40", 
                    "L206,240", 
                    "L46,240", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "Suit":
                d = [
                    "M70,53", 
                    "L90,40", 
                    "L128,160", 
                    "L128,252", 
                    "L72,246", 
                    "L72,118", 
                    "L66,240", 
                    "L30,240", 
                    "C30,180 30,90 70,53", 
                    "Z", 
                    "M166,40", 
                    "L186,53", 
                    "C226,90 226,180 226,240", 
                    "L190,240", 
                    "L184,118", 
                    "L184,246", 
                    "L128,252", 
                    "L128,160", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M70,53", 
                    "L90,40", 
                    "L128,160", 
                    "L70,80", 
                    "L84,60", 
                    "L74,54", 
                    "Z", 
                    "M186,53", 
                    "L166,40", 
                    "L128,160", 
                    "L186,80", 
                    "L172,60", 
                    "L182,54", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M90,40", 
                    "L166,40", 
                    "L128,160", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5,
                    slj: "bevel"
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(1) + ")");
                }));
                break;
            case "Onepiece":
                d = [
                    "M10,60", 
                    "L90,10", 
                    "A74,250 0 0,0 166,10", 
                    "L246,60", 
                    "L216,108", 
                    "L184,88", 
                    "L184,126", 
                    "L226,246", 
                    "L30,246", 
                    "L72,126", 
                    "L72,88", 
                    "L40,108", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "Socks":
                d = [
                    "M100,40", 
                    "L160,40", 
                    "L160,160", 
                    "L130,190", 
                    "A60,30 -45 0,1 87.4,147.4", 
                    "L100,134.8", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(svg("g", function (g) {
                    g.appendChild(path(d, {
                        stroke: "#000000",
                        sw: 5
                    }, function (path) {
                        path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                    }));
                }));
                el.appendChild(svg("g", function (g) {
                    g.setAttribute("transform", "translate(50,20)");
                    g.appendChild(path(d, {
                        stroke: "#000000",
                        sw: 5
                    }, function (path) {
                        path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                    }));
                }));
                break;
            case "L-Socks":
                d = [
                    "M100,40", 
                    "L140,40", 
                    "L140,170", 
                    "L120,190", 
                    "A40,20 -45 0,1 91.6,161.6", 
                    "L100,153.2", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(svg("g", function (g) {
                    g.appendChild(path(d, {
                        stroke: "#000000",
                        sw: 5
                    }, function (path) {
                        path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                    }));
                }));
                el.appendChild(svg("g", function (g) {
                    g.setAttribute("transform", "translate(30,20)");
                    g.appendChild(path(d, {
                        stroke: "#000000",
                        sw: 5
                    }, function (path) {
                        path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                    }));
                }));
                break;
            case "S-Socks":
                d = [
                    "M100,120", 
                    "L160,120", 
                    "L160,160", 
                    "L130,190", 
                    "A60,30 -45 0,1 87.4,147.4", 
                    "L100,134.8", 
                    "Z", 
                    
                ].join(" ");
                el.appendChild(svg("g", function (g) {
                    g.appendChild(path(d, {
                        stroke: "#000000",
                        sw: 5
                    }, function (path) {
                        path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                    }));
                }));
                el.appendChild(svg("g", function (g) {
                    g.setAttribute("transform", "translate(50,20)");
                    g.appendChild(path(d, {
                        stroke: "#000000",
                        sw: 5
                    }, function (path) {
                        path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                    }));
                }));
                break;
            case "Necktie":
                d = [
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
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                break;
            case "B-Necktie":
                d = [
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
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }, function (path) {
                    path.setAttribute("fill", "url(#" + makePattern(0) + ")");
                }));
                d = [
                    "M156,100", 
                    "A80,100 0 0,1 156,156", 
                    "M100,100", 
                    "A80,100 0 0,0 100,156", 
                    
                ].join(" ");
                el.appendChild(path(d, {
                    stroke: "#000000",
                    sw: 5
                }));
                break;
        }
        function makePattern(index) {
            var pat = patterns[index];
            if(!pat) {
                pat = {
                    type: "simple",
                    size: 0,
                    deg: 0,
                    colors: [
                        Cloth.defaultColors[index]
                    ]
                };
            }
            var pattern = Cloth.makePattern(pat);
            pattern.id = el.id + "-pattern" + index;
            defs.appendChild(pattern);
            return el.id + "-pattern" + index;
        }
    };
    Cloth.makePattern = function makePattern(pat) {
        var pattern = document.createElementNS(Cloth.svgNS, "pattern");
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        var size = pat.size;
        switch(pat.type) {
            case "simple":
                setwh(pattern, 0, 0, 256, 256);
                setvb(pattern.viewBox, 0, 0, 256, 256);
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, 0, 256, 256);
                    rect.setAttribute("fill", pat.colors[0]);
                }));
                break;
            case "2-check":
                setwh(pattern, 0, 0, size * 2, size * 2);
                setvb(pattern.viewBox, 0, 0, size * 2, size * 2);
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, 0, size, size);
                    rect.setAttribute("fill", pat.colors[0]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, size, size, size, size);
                    rect.setAttribute("fill", pat.colors[0]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, size, 0, size, size);
                    rect.setAttribute("fill", pat.colors[1]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, size, size, size);
                    rect.setAttribute("fill", pat.colors[1]);
                }));
                break;
            case "4-check":
                setwh(pattern, 0, 0, size * 2, size * 2);
                setvb(pattern.viewBox, 0, 0, size * 2, size * 2);
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, 0, size, size);
                    rect.setAttribute("fill", pat.colors[0]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, size, size, size, size);
                    rect.setAttribute("fill", pat.colors[2]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, size, 0, size, size);
                    rect.setAttribute("fill", pat.colors[1]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, size, size, size);
                    rect.setAttribute("fill", pat.colors[3]);
                }));
                break;
            case "2-stripe":
                setwh(pattern, 0, 0, 256, size * 2);
                setvb(pattern.viewBox, 0, 0, 256, size * 2);
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, 0, 256, size);
                    rect.setAttribute("fill", pat.colors[0]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, size, 256, size);
                    rect.setAttribute("fill", pat.colors[1]);
                }));
                break;
            case "3-stripe":
                setwh(pattern, 0, 0, 256, size * 3);
                setvb(pattern.viewBox, 0, 0, 256, size * 3);
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, 0, 256, size);
                    rect.setAttribute("fill", pat.colors[0]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, size, 256, size);
                    rect.setAttribute("fill", pat.colors[1]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, size * 2, 256, size);
                    rect.setAttribute("fill", pat.colors[2]);
                }));
                break;
            case "4-stripe":
                setwh(pattern, 0, 0, 256, size * 4);
                setvb(pattern.viewBox, 0, 0, 256, size * 4);
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, 0, 256, size);
                    rect.setAttribute("fill", pat.colors[0]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, size, 256, size);
                    rect.setAttribute("fill", pat.colors[1]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, size * 2, 256, size);
                    rect.setAttribute("fill", pat.colors[2]);
                }));
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, size * 3, 256, size);
                    rect.setAttribute("fill", pat.colors[3]);
                }));
                break;
            case "2-dot":
                setwh(pattern, 0, 0, size * 6, size * 6);
                setvb(pattern.viewBox, 0, 0, size * 6, size * 6);
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, 0, size * 6, size * 6);
                    rect.setAttribute("fill", pat.colors[0]);
                }));
                pattern.appendChild(svg("circle", function (c) {
                    var circle = c;
                    circle.setAttribute("cx", String(size * 1.5));
                    circle.setAttribute("cy", String(size * 1.5));
                    circle.setAttribute("r", String(size));
                    circle.setAttribute("fill", pat.colors[1]);
                }));
                pattern.appendChild(svg("circle", function (c) {
                    var circle = c;
                    circle.setAttribute("cx", String(size * 4.5));
                    circle.setAttribute("cy", String(size * 4.5));
                    circle.setAttribute("r", String(size));
                    circle.setAttribute("fill", pat.colors[1]);
                }));
                break;
        }
        if(pat.deg) {
            pattern.setAttribute("patternTransform", "rotate(" + pat.deg + ")");
        }
        return pattern;
        function setwh(pattern, x, y, width, height) {
            pattern.x.baseVal.valueAsString = x + "px";
            pattern.y.baseVal.valueAsString = y + "px";
            pattern.width.baseVal.valueAsString = width + "px";
            pattern.height.baseVal.valueAsString = height + "px";
        }
        function setvb(pattern, x, y, width, height) {
            pattern.baseVal.x = x;
            pattern.baseVal.y = y;
            pattern.baseVal.width = width;
            pattern.baseVal.height = height;
        }
    };
    Cloth.changePattern = function changePattern(index, pat, vg) {
        var defs = vg.getElementsByTagNameNS(Cloth.svgNS, "defs")[0];
        var pats = defs.getElementsByTagNameNS(Cloth.svgNS, "pattern");
        for(var i = 0, l = pats.length; i < l; i++) {
            if((pats[i]).id === vg.id + "-pattern" + index) {
                var newpatt = Cloth.makePattern(pat);
                newpatt.id = vg.id + "-pattern" + index;
                defs.replaceChild(newpatt, pats[i]);
                break;
            }
        }
    };
    return Cloth;
})();

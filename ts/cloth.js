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
            type: "Y-shirt",
            patternNumber: 4
        }, 
        {
            type: "U-shirt",
            patternNumber: 2
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
            defaultSize: 0,
            colorNumber: 1
        }
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
            case "Y-shirt":
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
        }
        function makePattern(index) {
            var pat = patterns[index];
            if(!pat) {
                pat = {
                    type: "simple",
                    size: 0,
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
        switch(pat.type) {
            case "simple":
                setwh(pattern, 0, 0, 256, 256);
                setvb(pattern.viewBox, 0, 0, 256, 256);
                pattern.setAttribute("patternUnits", "userSpaceOnUse");
                pattern.appendChild(svg("rect", function (r) {
                    var rect = r;
                    setwh(rect, 0, 0, 256, 256);
                    rect.setAttribute("fill", pat.colors[0]);
                }));
                break;
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

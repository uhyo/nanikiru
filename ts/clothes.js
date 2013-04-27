;
var Cloth = (function () {
    function Cloth() {
        this.clothType = null;
        this.colors = [];
        this.svg = null;
    }
    Cloth.svgNS = "http://www.w3.org/2000/svg";
    Cloth.prototype.importCloth = function (obj) {
        this.clothType = obj.clothType || null;
        this.colors = Array.isArray(obj.colors) ? obj.colors : [];
    };
    Cloth.importCloth = function importCloth(obj) {
        var c = new Cloth();
        c.importCloth(obj);
        return c;
    };
    Cloth.prototype.exportCloth = function () {
        return {
            clothType: this.clothType,
            colors: this.colors
        };
    };
    Cloth.prototype.getSVG = function (width, height) {
        if (typeof width === "undefined") { width = "256px"; }
        if (typeof height === "undefined") { height = "256px"; }
        var svg;
        if(this.svg) {
            svg = this.svg.cloneNode();
        } else {
            svg = this.svg = document.createElementNS(Cloth.svgNS, "svg");
            svg.setAttribute("version", "1.1");
            svg.viewBox.baseVal.x = 0 , svg.viewBox.baseVal.y = 0 , svg.viewBox.baseVal.width = 256 , svg.viewBox.baseVal.height = 256;
            this.makeCloth(svg, this.clothType);
        }
        svg.width.baseVal.valueAsString = width;
        svg.height.baseVal.valueAsString = height;
        this.setStyle(svg, this.colors);
        return svg;
    };
    Cloth.prototype.makeCloth = function (el, type) {
        var d;
        switch(type) {
            case "T-shirt":
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
                    path.className.baseVal = "color0";
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
                    path.className.baseVal = "color1";
                }));
                break;
        }
        function svg(name, callback) {
            var result = document.createElementNS(Cloth.svgNS, name);
            if(callback) {
                callback(result);
            }
            return result;
        }
        function path(d, v, callback) {
            var p = svg("path");
            p.setAttribute("d", d);
            if(v) {
                p.setAttribute("fill", v.fill || "none");
                p.setAttribute("stroke", v.stroke || "none");
                p.setAttribute("stroke-width", String(v.sw || 1));
                p.setAttribute("stroke-linejoin", v.slj || "miter");
            }
            if(callback) {
                callback(p);
            }
            return p;
        }
    };
    Cloth.prototype.setStyle = function (el, colors) {
        var result = null;
        var d = document;
        var nsr = d.createNSResolver(el);
        for(var i = 0, l = colors.length; i < l; i++) {
            result = d.evaluate("/descendant-or-self::*[@class='color" + i + "']", el, nsr, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, result);
            for(var j = 0, m = result.snapshotLength; j < m; j++) {
                result.snapshotItem(j).setAttribute("fill", colors[i]);
            }
        }
    };
    return Cloth;
})();

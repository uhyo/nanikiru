var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var UIObject = (function () {
        function UIObject() {
            this.oncloses = [];
            this.container = document.createElement("div");
        }
        UIObject.prototype.getContent = function () {
            return this.container;
        };
        UIObject.prototype.onclose = function (func) {
            this.oncloses.push(func);
        };
        UIObject.prototype.unclose = function (func) {
            this.oncloses = this.oncloses.filter(function (x) {
                x !== func;
            });
        };
        UIObject.prototype.close = function (returnValue) {
            this.oncloses.forEach(function (x) {
                x(returnValue);
            });
        };
        return UIObject;
    })();
    UI.UIObject = UIObject;    
    var UISection = (function (_super) {
        __extends(UISection, _super);
        function UISection() {
                _super.call(this);
            this.container = document.createElement("section");
        }
        return UISection;
    })(UIObject);
    UI.UISection = UISection;    
    var Scheduler = (function (_super) {
        __extends(Scheduler, _super);
        function Scheduler(doc) {
                _super.call(this);
            this.doc = doc;
        }
        Scheduler.prototype.setDate = function (d) {
            this.date = d;
            this.render(d);
        };
        Scheduler.prototype.render = function (d) {
        };
        Scheduler.getScheduler = function getScheduler(db, id, callback) {
            db.getScheduler(id, function (doc) {
                if(!doc) {
                    callback(null);
                }
                Scheduler.makeScheduler(doc, db, callback);
            });
        };
        Scheduler.makeScheduler = function makeScheduler(doc, db, callback) {
            var result = null;
            switch(doc.type) {
                case "calender":
                    result = new Calender(doc, db);
                    break;
            }
            callback(result);
        };
        Scheduler.types = {
            "calender": "カレンダー"
        };
        return Scheduler;
    })(UISection);
    UI.Scheduler = Scheduler;    
    var Calender = (function (_super) {
        __extends(Calender, _super);
        function Calender(doc, db) {
                _super.call(this, doc);
            this.doc = doc;
            this.db = db;
        }
        Calender.prototype.render = function (d) {
            var _this = this;
            var c = this.getContent();
            c.classList.add("calender");
            var currentMonth = d.getMonth(), currentDate = d.getDate();
            var mv = new Date(d.toJSON());
            mv.setDate(1);
            mv.setDate(1 - mv.getDay());
            var t = document.createElement("table");
            t.classList.add("calender");
            while(mv.getMonth() <= currentMonth) {
                var tr = t.insertRow(-1);
                for(var i = 0; i < 7; i++) {
                    var dd = mv.getDate(), mn = mv.getMonth();
                    var td = tr.insertCell(-1);
                    if(i === 0) {
                        td.classList.add("Sunday");
                    } else if(i === 6) {
                        td.classList.add("Saturday");
                    }
                    if(mn < currentMonth || currentMonth === mn && dd < currentDate) {
                        td.classList.add("past");
                    } else if(currentDate === dd && currentMonth === mn) {
                        td.classList.add("today");
                    }
                    td.appendChild(el("div", function (div) {
                        div.classList.add("date");
                        div.appendChild(el("time", function (time) {
                            var t = time;
                            t.dateTime = mv.getFullYear() + "-" + (mn + 1) + "-" + dd;
                            t.textContent = (mn !== currentMonth ? (mn + 1) + "/" : "") + dd;
                        }));
                    }));
                    mv.setDate(dd + 1);
                }
            }
            while(c.firstChild) {
                c.removeChild(c.firstChild);
            }
            c.appendChild(el("h1", function (h1) {
                h1.textContent = _this.doc.name;
            }));
            c.appendChild(el("div", function (div) {
                div.appendChild(el("button", function (b) {
                    var button = b;
                    button.title = "設定";
                    button.appendChild(icons.gear({
                        radius1: 90,
                        radius2: 35,
                        z: 10,
                        length: 24,
                        color: "#666666",
                        width: "24px",
                        height: "24px",
                        anime: "hover"
                    }));
                    button.addEventListener("click", function (e) {
                        var setting = new SchedulerConfig(_this.db, _this);
                        var modal = new ModalUI(_this);
                        modal.slide("simple", setting);
                        setting.onclose(function (returnValue) {
                            if(returnValue) {
                                _this.close("reload");
                            }
                        });
                    }, false);
                }));
                div.appendChild(el("button", function (b) {
                    var button = b;
                    button.title = "服グループ";
                    button.appendChild(Cloth.importCloth({
                        clothType: "T-shirt",
                        colors: [
                            "#999999", 
                            "#999999"
                        ]
                    }).getSVG("24px", "24px"));
                    button.addEventListener("click", function (e) {
                        _this.close("clothGroupEdit");
                    }, false);
                }));
            }));
            c.appendChild(t);
        };
        return Calender;
    })(Scheduler);
    UI.Calender = Calender;    
    var SchedulerConfig = (function (_super) {
        __extends(SchedulerConfig, _super);
        function SchedulerConfig(db, scheduler) {
            var _this = this;
                _super.call(this);
            this.db = db;
            this.scheduler = scheduler;
            var c = this.getContent();
            var doc = scheduler.doc;
            c.appendChild(el("h1", function (h1) {
                h1.appendChild(icons.gear({
                    radius1: 90,
                    radius2: 35,
                    z: 10,
                    length: 24,
                    color: "#888888",
                    width: "32px",
                    height: "32px",
                    anime: "always"
                }));
                h1.appendChild(document.createTextNode(doc.name + "の設定"));
            }));
            c.appendChild(el("form", function (form) {
                form.appendChild(el("dl", function (dl) {
                    dl.appendChild(el("dt", function (dt) {
                        dt.textContent = "種類";
                    }));
                    dl.appendChild(el("dd", function (dd) {
                        dd.appendChild(el("select", function (s) {
                            var select = s;
                            select.name = "type";
                            for(var key in Scheduler.types) {
                                select.add(el("option", function (o) {
                                    var option = o;
                                    option.value = key;
                                    option.text = Scheduler.types[key];
                                    if(key === doc.type) {
                                        option.selected = true;
                                    }
                                }));
                            }
                        }));
                    }));
                    dl.appendChild(el("dt", function (dt) {
                        dt.textContent = "名前";
                    }));
                    dl.appendChild(el("input", function (i) {
                        var input = i;
                        input.name = "name";
                        input.size = 30;
                        input.value = doc.name;
                        input.required = true;
                    }));
                }));
                form.appendChild(el("p", function (p) {
                    p.appendChild(el("input", function (i) {
                        var input = i;
                        input.type = "submit";
                        input.value = "変更を保存";
                    }));
                    p.appendChild(el("input", function (i) {
                        var input = i;
                        input.type = "button";
                        input.value = "キャンセル";
                        input.addEventListener("click", function (e) {
                            _this.close(false);
                        }, false);
                    }));
                }));
                form.addEventListener("submit", function (e) {
                    e.preventDefault();
                    doc.type = ((form).elements["type"]).value;
                    doc.name = ((form).elements["name"]).value;
                    _this.save(doc);
                }, false);
            }));
        }
        SchedulerConfig.prototype.save = function (doc) {
            var _this = this;
            var db = this.db;
            db.setScheduler(doc, function (result) {
                _this.close(true);
            });
        };
        return SchedulerConfig;
    })(UISection);
    UI.SchedulerConfig = SchedulerConfig;    
    var DateIndicator = (function (_super) {
        __extends(DateIndicator, _super);
        function DateIndicator(scheduler) {
                _super.call(this);
            this.scheduler = scheduler;
            var date = scheduler.date;
            var c = this.getContent();
            c.classList.add("dateindicator");
            c.appendChild(el("h1", function (h1) {
                h1.appendChild(el("time", function (t) {
                    var time = t;
                    time.dateTime = date.toJSON();
                    time.textContent = (date.getMonth() + 1) + "/" + date.getDate();
                }));
            }));
        }
        return DateIndicator;
    })(UISection);
    UI.DateIndicator = DateIndicator;    
    var SchedulerContainer = (function (_super) {
        __extends(SchedulerContainer, _super);
        function SchedulerContainer(id, db) {
                _super.call(this);
            this.id = id;
            this.db = db;
        }
        SchedulerContainer.prototype.open = function () {
            var _this = this;
            UI.Scheduler.getScheduler(this.db, this.id, function (result) {
                var c = _this.getContent();
                c.classList.add("scheduler-container");
                while(c.firstChild) {
                    c.removeChild(c.firstChild);
                }
                if(result) {
                    _this.id = result.doc.id;
                    result.setDate(new Date());
                    c.appendChild(result.getContent());
                    result.onclose(function (returnValue) {
                        if(returnValue === "reload") {
                            _this.open();
                        } else {
                            _this.close(returnValue);
                        }
                    });
                    var datewin = new DateIndicator(result);
                    c.appendChild(datewin.getContent());
                } else {
                    c.appendChild(el("p", function (p) {
                        p.textContent = "スケジューラがありません。";
                    }));
                }
            });
        };
        return SchedulerContainer;
    })(UIObject);
    UI.SchedulerContainer = SchedulerContainer;    
    var ClothGroupList = (function (_super) {
        __extends(ClothGroupList, _super);
        function ClothGroupList(db, schedulerid) {
                _super.call(this);
            this.db = db;
            var c = this.getContent();
            c.classList.add("clothgroup-list");
            var count = 0;
            if(schedulerid != null) {
                db.getScheduler(schedulerid, function (schedulerdoc) {
                    if(schedulerdoc == null) {
                        c.appendChild(el("p", function (p) {
                            p.textContent = "エラー:そのスケジューラの情報は取得できません。";
                        }));
                        return;
                    }
                    c.appendChild(el("h1", function (h1) {
                        h1.textContent = schedulerdoc.name + "に属する服グループ";
                    }));
                    schedulerdoc.groups.forEach(function (id, i) {
                        db.getClothGroup(id, function (result) {
                            if(result) {
                                addlist(result);
                            }
                            if(i + 1 === schedulerdoc.groups.length) {
                                addlist(null);
                            }
                        });
                    });
                    if(!schedulerdoc.groups.length) {
                        addlist(null);
                    }
                });
            } else {
                c.appendChild(el("h1", function (h1) {
                    h1.textContent = "全ての服グループ";
                }));
                db.eachClothGroup(null, addlist);
            }
function addlist(doc) {
                if(doc) {
                    count++;
                    var div = el("div", function (div) {
                        div.appendChild(icons.clothgroup({
                            colors: [
                                "#aaaaaa", 
                                "#888888", 
                                "#666666"
                            ],
                            width: "32px",
                            height: "32px"
                        }));
                        div.appendChild(document.createTextNode(doc.name));
                    });
                } else {
                    fin();
                }
            }
function fin() {
                if(count === 0) {
                    c.appendChild(el("p", function (p) {
                        p.textContent = "服グループはまだありません。";
                    }));
                }
            }
        }
        return ClothGroupList;
    })(UISection);
    UI.ClothGroupList = ClothGroupList;    
    var ModalUI = (function () {
        function ModalUI(ui) {
            this.ui = ui;
            this.returnValue = void 0;
            this.container = document.createElement("div");
            var c = ui.getContent();
            if(c.parentNode) {
                c.parentNode.replaceChild(this.container, c);
                this.container.appendChild(c);
            }
        }
        ModalUI.prototype.slide = function (mode, dia, callback) {
            this.dia = dia;
            var tc = this.container, bc = this.ui.getContent(), nc = dia.getContent();
            if(mode === "simple") {
                bc.style.display = "none";
                tc.appendChild(nc);
            }
            dia.onclose(function (returnValue) {
                if(callback) {
                    callback(returnValue);
                }
                if(nc.parentNode === tc) {
                    tc.removeChild(nc);
                }
                bc.style.display = null;
            });
        };
        return ModalUI;
    })();    
    function vendorPrefix(style, name, value, nameprefix, valueprefix) {
        if(nameprefix) {
            [
                "-webkit-", 
                "-moz-", 
                ""
            ].forEach(function (prefix) {
                setValue(prefix + name);
            });
        } else {
            setValue(name);
        }
        function setValue(name) {
            if(valueprefix) {
                [
                    "-webkit-", 
                    "-moz-", 
                    ""
                ].forEach(function (prefix) {
                    style.setProperty(name, prefix + value, null);
                });
            } else {
                style.setProperty(name, value, null);
            }
        }
    }
    function el(name, callback) {
        var result = document.createElement(name);
        if(callback) {
            callback(result);
        }
        return result;
    }
    var icons;
    (function (icons) {
        function gear(option) {
            return svg("svg", function (s) {
                var result = s;
                result.setAttribute("version", "1.1");
                result.width.baseVal.valueAsString = option.width;
                result.height.baseVal.valueAsString = option.height;
                result.viewBox.baseVal.x = 0 , result.viewBox.baseVal.y = 0 , result.viewBox.baseVal.width = 256 , result.viewBox.baseVal.height = 256;
                var cwidth = option.radius1 - option.radius2, cr = (option.radius1 + option.radius2) / 2;
                var tdeg = Math.PI / option.z, twidth = tdeg * option.radius1;
                result.appendChild(svg("circle", function (c) {
                    var circle = c;
                    circle.cx.baseVal.valueAsString = "128px" , circle.cy.baseVal.valueAsString = "128px";
                    circle.r.baseVal.valueAsString = cr + "px";
                    circle.setAttribute("fill", "none");
                    circle.setAttribute("stroke", option.color);
                    circle.setAttribute("stroke-width", String(cwidth));
                }));
                result.appendChild(svg("g", function (g) {
                    if(option.anime) {
                        var ani = svg("animateTransform");
                        ani.setAttribute("attributeName", "transform");
                        ani.setAttribute("attributeType", "XML");
                        ani.setAttribute("type", "rotate");
                        ani.setAttribute("from", "0 128 128");
                        ani.setAttribute("to", "360 128 128");
                        ani.setAttribute("dur", "5s");
                        ani.setAttribute("repeatCount", "indefinite");
                        ani.setAttribute("begin", "0s");
                        ani.setAttribute("fill", "freeze");
                        g.appendChild(ani);
                        switch(option.anime) {
                            case "hover":
                                registerHoverAnimation(result);
                                break;
                            case "always":
                                break;
                        }
                    }
                    var le = option.length + cwidth / 2;
                    for(var i = 0; i < option.z; i++) {
                        g.appendChild(svg("line", function (l) {
                            var line = l;
                            var deg = 2 * i * tdeg;
                            line.x1.baseVal.valueAsString = (128 + cr * Math.cos(deg)) + "px";
                            line.y1.baseVal.valueAsString = (128 + cr * Math.sin(deg)) + "px";
                            line.x2.baseVal.valueAsString = (128 + (cr + le) * Math.cos(deg)) + "px";
                            line.y2.baseVal.valueAsString = (128 + (cr + le) * Math.sin(deg)) + "px";
                            line.setAttribute("stroke", option.color);
                            line.setAttribute("stroke-width", String(twidth));
                        }));
                    }
                }));
            });
        }
        icons.gear = gear;
        function clothgroup(option) {
            return svg("svg", function (r) {
                var result = r;
                result.width.baseVal.valueAsString = option.width;
                result.height.baseVal.valueAsString = option.height;
                for(var i = 0; i < 3; i++) {
                    var g = onecloth(option.colors[i]);
                    var trtr = (i - 1) * 30;
                    g.setAttribute("transform", "transform(" + trtr + ") scale(0.9");
                    result.appendChild(g);
                }
                function onecloth(color) {
                    return svg("g", function (g) {
                        var d = [
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
                        g.appendChild(svg("path", function (path) {
                            path.setAttribute("d", d);
                            path.setAttribute("fill", color);
                        }));
                    });
                }
            });
        }
        icons.clothgroup = clothgroup;
        var svgNS = "http://www.w3.org/2000/svg";
        function svg(name, callback) {
            var result = document.createElementNS(svgNS, name);
            if(callback) {
                callback(result);
            }
            return result;
        }
        function registerHoverAnimation(el) {
            var flag = false;
            el.pauseAnimations();
            el.addEventListener("mouseover", function (e) {
                if(flag) {
                    return;
                }
                el.unpauseAnimations();
                flag = true;
            }, false);
            el.addEventListener("mouseout", function (ee) {
                var e = ee;
                if(!flag) {
                    return;
                }
                if(e.relatedTarget !== el && !(el.compareDocumentPosition(e.relatedTarget) & el.DOCUMENT_POSITION_CONTAINED_BY)) {
                    el.pauseAnimations();
                    flag = false;
                }
            }, false);
        }
    })(icons || (icons = {}));
})(UI || (UI = {}));

var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
;
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
            this.schedulerid = schedulerid;
            var _self = this;
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
                    c.appendChild(selectbox.clothgroup(doc, function (e) {
                        var info = new ClothGroupInfo(db, doc.id);
                        var modal = new ModalUI(_self);
                        modal.slide("simple", info, function (mode) {
                            if(mode != null) {
                                _self.close(mode);
                            }
                        });
                    }));
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
                c.appendChild(el("p", function (p) {
                    p.appendChild(el("button", function (b) {
                        var button = b;
                        button.appendChild(icons.plus({
                            color: "#666666",
                            width: "24px",
                            height: "24px"
                        }));
                        button.appendChild(document.createTextNode("新しい服グループを追加"));
                        button.addEventListener("click", function (e) {
                            var info = new ClothGroupInfo(db, null, schedulerid);
                            var modal = new ModalUI(_self);
                            modal.slide("simple", info, function (returnValue) {
                                if(returnValue != null) {
                                    _self.close(returnValue);
                                }
                            });
                        }, false);
                    }));
                }));
            }
        }
        return ClothGroupList;
    })(UISection);
    UI.ClothGroupList = ClothGroupList;    
    var ClothGroupInfo = (function (_super) {
        __extends(ClothGroupInfo, _super);
        function ClothGroupInfo(db, clothgroupid, schedulerid) {
                _super.call(this);
            this.db = db;
            this.clothgroupid = clothgroupid;
            this.open(schedulerid);
        }
        ClothGroupInfo.prototype.open = function (schedulerid) {
            var _self = this;
            var db = this.db, clothgroupid = this.clothgroupid;
            var c = this.getContent();
            c.classList.add("clothgroup-info");
            empty(c);
            var doc = null;
            if(clothgroupid != null) {
                db.getClothGroup(clothgroupid, function (doc) {
                    if(doc == null) {
                        c.appendChild(el("p", function (p) {
                            p.textContent = "この服グループの情報は取得できません。";
                        }));
                    } else {
                        useInfo(doc);
                    }
                });
            } else {
                doc = {
                    id: -Infinity,
                    name: "新しい服グループ",
                    made: new Date()
                };
                useInfo(doc);
            }
            function useInfo(doc) {
                c.appendChild(el("h1", function (h1) {
                    h1.appendChild(icons.clothgroup({
                        width: "32px",
                        height: "32px"
                    }));
                    h1.appendChild(document.createTextNode(doc.name));
                }));
                c.appendChild(el("section", function (section) {
                    section.appendChild(el("h1", function (h1) {
                        h1.appendChild(icons.gear({
                            width: "28px",
                            height: "28px",
                            anime: "always"
                        }));
                        h1.appendChild(document.createTextNode("設定"));
                    }));
                    section.appendChild(el("form", function (f) {
                        var form = f;
                        form.appendChild(el("p", function (p) {
                            p.textContent = "名前:";
                            p.appendChild(el("input", function (i) {
                                var input = i;
                                input.name = "name";
                                input.size = 30;
                                input.placeholder = "名前";
                                input.value = doc.name;
                            }));
                        }));
                        form.appendChild(el("p", function (p) {
                            p.appendChild(el("input", function (i) {
                                var input = i;
                                input.type = "submit";
                                input.value = "決定";
                            }));
                        }));
                        form.addEventListener("submit", function (e) {
                            e.preventDefault();
                            var name = (form.elements["name"]).value;
                            if(clothgroupid == null) {
                                delete doc.id;
                            }
                            doc.name = name;
                            db.setClothGroup(doc, function (id) {
                                console.log(doc, id);
                                if(id != null) {
                                    doc.id = id;
                                    _self.clothgroupid = id;
                                    if(schedulerid != null) {
                                        db.getScheduler(schedulerid, function (schedulerdoc) {
                                            console.log(schedulerdoc);
                                            if(schedulerdoc) {
                                                if(schedulerdoc.groups.indexOf(id) < 0) {
                                                    schedulerdoc.groups.push(id);
                                                    db.setScheduler(schedulerdoc, function (result) {
                                                        _self.open();
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        _self.open();
                                    }
                                }
                            });
                        }, false);
                    }));
                }));
                c.appendChild(el("section", function (section) {
                    if(schedulerid != null) {
                        section.hidden = true;
                    }
                    section.appendChild(el("h1", function (h1) {
                        h1.textContent = "所属スケジューラ";
                    }));
                    var count = 0;
                    db.eachScheduler({
                        group: doc.id
                    }, function (sdoc) {
                        if(sdoc == null) {
                            if(count === 0) {
                                section.appendChild(el("p", function (p) {
                                    p.textContent = "所属スケジューラはありません。";
                                }));
                            }
                            return;
                        }
                        section.appendChild(selectbox.scheduler(sdoc, function (mode) {
                            _self.close("scheduler::" + sdoc.id);
                        }));
                        count++;
                    });
                }));
                c.appendChild(el("section", function (section) {
                    if(schedulerid != null) {
                        section.hidden = true;
                    }
                    section.appendChild(el("h1", function (h1) {
                        h1.textContent = "服の一覧";
                    }));
                    var count = 0;
                    db.eachCloth({
                        group: doc.id
                    }, function (cdoc) {
                        if(cdoc == null) {
                            if(count === 0) {
                                section.appendChild(el("p", function (p) {
                                    p.textContent = "服は登録されていません。";
                                }));
                            }
                            section.appendChild(el("p", function (p) {
                                p.appendChild(el("button", function (b) {
                                    var button = b;
                                    button.appendChild(icons.plus({
                                        color: "#666666",
                                        width: "24px",
                                        height: "24px"
                                    }));
                                    button.appendChild(document.createTextNode("新しい服を作成して登録"));
                                    button.addEventListener("click", function (e) {
                                    }, false);
                                }));
                            }));
                            return;
                        }
                        section.appendChild(selectbox.cloth(cdoc, function (mode) {
                            _self.close("cloth::" + cdoc.id);
                        }));
                        count++;
                    });
                }));
                c.appendChild(el("p", function (p) {
                    p.appendChild(el("button", function (b) {
                        var button = b;
                        button.textContent = "戻る";
                        button.addEventListener("click", function (e) {
                            _self.close();
                        }, false);
                    }));
                }));
            }
        };
        return ClothGroupInfo;
    })(UISection);
    UI.ClothGroupInfo = ClothGroupInfo;    
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
                if(nc.parentNode === tc) {
                    tc.removeChild(nc);
                }
                if(tc.parentNode) {
                    tc.parentNode.replaceChild(bc, tc);
                }
                bc.style.display = null;
                if(callback) {
                    callback(returnValue);
                }
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
            setDefault(option, {
                radius1: 90,
                radius2: 35,
                z: 10,
                length: 24,
                color: "#666666"
            });
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
            setDefault(option, {
                colors: [
                    "#aaaaaa", 
                    "#888888", 
                    "#666666"
                ]
            });
            return svg("svg", function (r) {
                var result = r;
                result.width.baseVal.valueAsString = option.width;
                result.height.baseVal.valueAsString = option.height;
                result.viewBox.baseVal.x = 0 , result.viewBox.baseVal.y = 0 , result.viewBox.baseVal.width = 256 , result.viewBox.baseVal.height = 256;
                for(var i = 0; i < 3; i++) {
                    var g = onecloth(option.colors[i]);
                    var trtr = (i - 1) * 30;
                    g.setAttribute("transform", "translate(" + trtr + " " + trtr + ") scale(0.9)");
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
        function plus(option) {
            setDefault(option, {
                color: "#666666"
            });
            return svg("svg", function (r) {
                var result = r;
                result.width.baseVal.valueAsString = option.width;
                result.height.baseVal.valueAsString = option.height;
                result.viewBox.baseVal.x = 0 , result.viewBox.baseVal.y = 0 , result.viewBox.baseVal.width = 256 , result.viewBox.baseVal.height = 256;
                result.appendChild(svg("g", function (g) {
                    g.appendChild(svg("line", function (l) {
                        var line = l;
                        line.x1.baseVal.valueAsString = "48px";
                        line.y1.baseVal.valueAsString = "128px";
                        line.x2.baseVal.valueAsString = "208px";
                        line.y2.baseVal.valueAsString = "128px";
                        line.setAttribute("stroke-width", "48px");
                        line.setAttribute("stroke", option.color);
                    }));
                    g.appendChild(svg("line", function (l) {
                        var line = l;
                        line.x1.baseVal.valueAsString = "128px";
                        line.y1.baseVal.valueAsString = "48px";
                        line.x2.baseVal.valueAsString = "128px";
                        line.y2.baseVal.valueAsString = "208px";
                        line.setAttribute("stroke-width", "48px");
                        line.setAttribute("stroke", option.color);
                    }));
                }));
            });
        }
        icons.plus = plus;
        function calender(option) {
            setDefault(option, {
                color: "#777777"
            });
            return svg("svg", function (r) {
                var result = r;
                result.width.baseVal.valueAsString = option.width;
                result.height.baseVal.valueAsString = option.height;
                result.viewBox.baseVal.x = 0 , result.viewBox.baseVal.y = 0 , result.viewBox.baseVal.width = 256 , result.viewBox.baseVal.height = 256;
                result.appendChild(svg("rect", function (r) {
                    var rect = r;
                    rect.x.baseVal.valueAsString = "30px";
                    rect.y.baseVal.valueAsString = "30px";
                    rect.width.baseVal.valueAsString = "196px";
                    rect.height.baseVal.valueAsString = "30px";
                    rect.setAttribute("fill", option.color);
                }));
                for(var x = 0; x < 5; x++) {
                    var xi = 30 + (196 / 4 * x) + "px";
                    result.appendChild(svg("line", function (l) {
                        var line = l;
                        line.x1.baseVal.valueAsString = xi;
                        line.y1.baseVal.valueAsString = "30px";
                        line.x2.baseVal.valueAsString = xi;
                        line.y2.baseVal.valueAsString = "226px";
                        line.setAttribute("stroke", option.color);
                        line.setAttribute("stroke-width", "8px");
                    }));
                }
                for(var y = 1; y < 4; y++) {
                    var yi = 60 + (166 / 3 * y) + "px";
                    result.appendChild(svg("line", function (l) {
                        var line = l;
                        line.x1.baseVal.valueAsString = "30px";
                        line.y1.baseVal.valueAsString = yi;
                        line.x2.baseVal.valueAsString = "226px";
                        line.y2.baseVal.valueAsString = yi;
                        line.setAttribute("stroke", option.color);
                        line.setAttribute("stroke-width", "8px");
                    }));
                }
            });
        }
        icons.calender = calender;
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
        function setDefault(obj, def) {
            for(var key in def) {
                if(!(key in obj)) {
                    obj[key] = def[key];
                }
            }
        }
    })(icons || (icons = {}));
    var selectbox;
    (function (selectbox) {
        function scheduler(doc, clickhandler) {
            return el("div", function (div) {
                div.classList.add("schedulerbox");
                div.classList.add("selection");
                switch(doc.type) {
                    case "calender":
                        div.appendChild(icons.calender({
                            width: "32px",
                            height: "32px"
                        }));
                        break;
                }
                div.appendChild(document.createTextNode(doc.name));
                if(clickhandler) {
                    div.addEventListener("click", function (e) {
                        clickhandler("normal");
                    }, false);
                }
            });
        }
        selectbox.scheduler = scheduler;
        function clothgroup(doc, clickhandler) {
            return el("div", function (div) {
                div.classList.add("clothgroupbox");
                div.classList.add("selection");
                div.appendChild(icons.clothgroup({
                    width: "32px",
                    height: "32px"
                }));
                div.appendChild(document.createTextNode(doc.name));
                if(clickhandler) {
                    div.addEventListener("click", function (e) {
                        clickhandler("normal");
                    }, false);
                }
            });
        }
        selectbox.clothgroup = clothgroup;
        function cloth(doc, clickhandler) {
            return el("div", function (div) {
                div.classList.add("clothbox");
                div.classList.add("selection");
                var cloth = Cloth.importCloth(doc);
                div.appendChild(cloth.getSVG("32px", "32px"));
                if(clickhandler) {
                    div.addEventListener("click", function (e) {
                        clickhandler("normal");
                    }, false);
                }
            });
        }
        selectbox.cloth = cloth;
    })(selectbox || (selectbox = {}));
    function empty(el) {
        while(el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }
})(UI || (UI = {}));
var Cloth = (function () {
    function Cloth() {
        this.clothType = null;
        this.patterns = [];
        this.svg = null;
    }
    Cloth.svgNS = "http://www.w3.org/2000/svg";
    Cloth.prototype.importCloth = function (obj) {
        this.clothType = obj.clothType || null;
        this.patterns = Array.isArray(obj.pattenrs) ? obj.patterns : [];
    };
    Cloth.importCloth = function importCloth(obj) {
        var c = new Cloth();
        c.importCloth(obj);
        return c;
    };
    Cloth.prototype.exportCloth = function () {
        return {
            clothType: this.clothType,
            patterns: this.patterns
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
            this.makeCloth(svg);
        }
        svg.width.baseVal.valueAsString = width;
        svg.height.baseVal.valueAsString = height;
        this.setStyle(svg);
        return svg;
    };
    Cloth.prototype.makeCloth = function (el) {
        var type = this.clothType;
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
    Cloth.prototype.setStyle = function (el) {
    };
    return Cloth;
})();

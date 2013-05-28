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
        function Scheduler(db, doc) {
                _super.call(this);
            this.db = db;
            this.doc = doc;
            this.logs = {
            };
        }
        Scheduler.prototype.setDate = function (d) {
            this.date = d;
            this.render(d);
        };
        Scheduler.prototype.render = function (d) {
        };
        Scheduler.prototype.loadLogs = function (d, callback) {
            callback();
        };
        Scheduler.prototype.calculateScore = function (logs, d, callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            callback({
            });
        };
        Scheduler.getScheduler = function getScheduler(db, id, callback) {
            db.getScheduler(id, function (doc) {
                if(!doc) {
                    callback(null);
                    return;
                }
                Scheduler.makeScheduler(doc, db, callback);
            });
        };
        Scheduler.makeScheduler = function makeScheduler(doc, db, callback) {
            var result = null;
            switch(doc.type) {
                case "calender":
                    result = new Calender(db, doc);
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
        function Calender(db, doc) {
                _super.call(this, db, doc);
            this.db = db;
            this.doc = doc;
        }
        Calender.prototype.render = function (d) {
            var _this = this;
            var db = this.db;
            var c = this.getContent();
            c.classList.add("calender");
            var currentMonth = d.getMonth(), currentDate = d.getDate();
            var mv = this.startDate(d);
            this.loadLogs(d, function () {
                var logs = _this.logs;
                var t = document.createElement("table");
                t.classList.add("calender");
                while(mv.getMonth() <= currentMonth) {
                    var tr = t.insertRow(-1);
                    for(var i = 0; i < 7; i++) {
                        var dd = mv.getDate(), mn = mv.getMonth();
                        var td = tr.insertCell(-1);
                        td.classList.add("datecell");
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
                        var dateStr = mv.getFullYear() + "-" + (mn + 1) + "-" + dd;
                        td.dataset.date = dateStr;
                        td.appendChild(el("div", function (div) {
                            div.classList.add("date");
                            div.appendChild(el("time", function (time) {
                                var t = time;
                                t.dateTime = dateStr;
                                t.textContent = (mn !== currentMonth ? (mn + 1) + "/" : "") + dd;
                            }));
                        }));
                        if(logs[dateStr]) {
                            td.classList.add("haslog");
                            td.appendChild(el("div", function (div) {
                                div.classList.add("dailylog");
                                var clothas = [];
                                logs[dateStr].cloth.forEach(function (clothid) {
                                    db.getCloth(clothid, function (clothdoc) {
                                        var main = _this.doc.groups.slice(0, 2);
                                        if(main.some(function (x) {
                                            return clothdoc.group.indexOf(x) >= 0;
                                        })) {
                                            div.appendChild(Cloth.importCloth({
                                                type: clothdoc.type,
                                                patterns: clothdoc.patterns
                                            }).getSVG("32px", "32px"));
                                        }
                                    });
                                });
                            }));
                        }
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
                        button.classList.add("iconbutton");
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
                            var modal = new ModalUI(_this);
                            var setting = new SchedulerConfig(_this.db, _this);
                            modal.slide("simple", setting);
                            setting.onclose(function (returnValue) {
                                if(returnValue) {
                                    _this.close(returnValue);
                                } else {
                                    _this.close("scheduler::open:" + _this.doc.id);
                                }
                            });
                        }, false);
                    }));
                }));
                c.appendChild(t);
                t.addEventListener("click", function (e) {
                    var node = e.target;
                    do {
                        if(node.classList && node.classList.contains("datecell")) {
                            if(!node.classList.contains("haslog")) {
                                var thisdate = new Date(node.dataset.date);
                                var modal = new ModalUI(_this);
                                var dv = new DayVision(db, _this);
                                dv.open(thisdate);
                                modal.slide("simple", dv, function (returnValue) {
                                    if(returnValue) {
                                        _this.close(returnValue);
                                    }
                                });
                            } else {
                                var modal = new ModalUI(_this);
                                var dl = new DayLog(db, _this);
                                dl.open(new Date(node.dataset.date));
                                modal.slide("simple", dl, function (returnValue) {
                                    if(returnValue) {
                                        _this.close(returnValue);
                                    }
                                });
                            }
                        }
                    }while(node = node.parentNode);
                }, false);
            });
            help(function (helpel) {
                helpel.appendChild(el("h1", function (h1) {
                    h1.textContent = "スケジューラ";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "スケジューラには着た服を記録することができます。カレンダーのマスをクリックしましょう。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "まだ服を登録していない場合は、スケジューラの";
                    p.appendChild(icons.gear({
                        width: "18px",
                        height: "18px"
                    }));
                    p.appendChild(document.createTextNode("ボタンをクリックして登録しましょう。"));
                }));
            });
        };
        Calender.prototype.startDate = function (d) {
            var mv = new Date(d.toJSON());
            mv.setDate(1);
            mv.setDate(1 - mv.getDay());
            mv = zeroDate(mv);
            return mv;
        };
        Calender.prototype.lastDate = function (d) {
            var result = this.startDate(d);
            result.setDate(result.getDate() + 34);
            return result;
        };
        Calender.prototype.loadLogs = function (d, callback) {
            var st = this.startDate(d), ls = this.lastDate(d);
            var db = this.db, logs = this.logs = {
            };
            db.eachLog({
                scheduler: this.doc.id,
                date: {
                    start: st,
                    end: ls
                }
            }, function (log) {
                if(log == null) {
                    callback();
                    return;
                }
                var thisd = log.date;
                var thisds = thisd.getFullYear() + "-" + (thisd.getMonth() + 1) + "-" + thisd.getDate();
                logs[thisds] = log;
            });
        };
        Calender.prototype.calculateScore = function (logs, d, callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            var db = this.db, doc = this.doc;
            var cs = {
            };
            var clothscores = {
            };
            var ds = [];
            var startd = zeroDate(d);
            for(var key in logs) {
                var dd = zeroDate(new Date(key));
                var sub = Math.floor((startd.getTime() - dd.getTime()) / (1000 * 3600 * 24));
                var badpoint = 0;
                if(sub === 1) {
                    badpoint = 10;
                } else if(sub === 2) {
                    badpoint = 4;
                } else if(sub === 3) {
                    badpoint = 1;
                }
                var log = logs[key];
                if(badpoint > 0) {
                    log.cloth.forEach(function (clothid) {
                        if(clothscores[clothid] == null) {
                            clothscores[clothid] = -badpoint;
                        } else {
                            clothscores[clothid] -= badpoint;
                        }
                    });
                    ds.push({
                        cloth: log.cloth,
                        badpoint: badpoint
                    });
                }
            }
            var mains = doc.groups.slice(0, 2);
            if(mains.length === 0) {
                callback(cs);
                return;
            }
            if(mains.length === 1) {
                db.eachCloth({
                    group: mains[0]
                }, function (cdoc) {
                    if(cdoc != null) {
                        var keyarrstr = "[" + cdoc.id + "]";
                        var score = cdoc.status !== "active" ? -Infinity : clothscores[cdoc.id] || 0;
                        if(cdoc.used) {
                            score -= cdoc.used;
                        }
                        if(cs[keyarrstr] == null) {
                            cs[keyarrstr] = score;
                        } else {
                            cs[keyarrstr] += score;
                        }
                    } else {
                        callback(cs);
                    }
                });
                return;
            }
            if(mains.length === 2) {
                var cloths1 = [];
                db.eachCloth({
                    group: mains[0]
                }, function (cdoc) {
                    if(cdoc != null) {
                        cloths1.push(cdoc.id);
                        if(cdoc.status !== "active") {
                            clothscores[cdoc.id] = -Infinity;
                        } else if(cdoc.used) {
                            if(clothscores[cdoc.id] != null) {
                                clothscores[cdoc.id] -= cdoc.used;
                            } else {
                                clothscores[cdoc.id] = -cdoc.used;
                            }
                        }
                    } else {
                        var cloths2 = [];
                        db.eachCloth({
                            group: mains[1]
                        }, function (cdoc) {
                            if(cdoc != null) {
                                cloths2.push(cdoc.id);
                                if(cdoc.status !== "active") {
                                    clothscores[cdoc.id] = -Infinity;
                                } else if(cdoc.used) {
                                    if(clothscores[cdoc.id] != null) {
                                        clothscores[cdoc.id] -= cdoc.used;
                                    } else {
                                        clothscores[cdoc.id] = -cdoc.used;
                                    }
                                }
                            } else {
                                cloths1.forEach(function (cid1) {
                                    cloths2.forEach(function (cid2) {
                                        var score = (clothscores[cid1] || 0) + (clothscores[cid2] || 0);
                                        var keyarr = [
                                            cid1, 
                                            cid2
                                        ].sort();
                                        var keyarrstr = JSON.stringify(keyarr);
                                        if(cs[keyarrstr] == null) {
                                            cs[keyarrstr] = score;
                                        } else {
                                            cs[keyarrstr] += score;
                                        }
                                        ds.forEach(function (obj) {
                                            if(obj.cloth.indexOf(cid1) >= 0 && obj.cloth.indexOf(cid2) >= 0) {
                                                cs[keyarrstr] -= obj.badpoint;
                                            }
                                        });
                                    });
                                });
                                callback(cs);
                            }
                        });
                    }
                });
                return;
            }
        };
        return Calender;
    })(Scheduler);
    UI.Calender = Calender;    
    var SchedulerConfig = (function (_super) {
        __extends(SchedulerConfig, _super);
        function SchedulerConfig(db, scheduler) {
                _super.call(this);
            this.db = db;
            this.scheduler = scheduler;
            this.open();
        }
        SchedulerConfig.prototype.open = function () {
            var _this = this;
            var db = this.db, scheduler = this.scheduler, doc = scheduler.doc;
            var c = this.getContent();
            empty(c);
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
                }));
                form.addEventListener("submit", function (e) {
                    e.preventDefault();
                    doc.name = ((form).elements["name"]).value;
                    _this.save(doc);
                }, false);
            }));
            var list = new ClothGroupList(db, {
                schedulerid: doc.id,
                add: true,
                selectadd: true,
                del: true
            });
            list.onclose(function (returnValue) {
                if("string" === typeof returnValue) {
                    var result;
                    if(result = returnValue.match(/^select;(\d+)$/)) {
                        _this.close("clothgroup::id:" + result[1]);
                        return;
                    } else if(result = returnValue.match(/^delete;(\d+)$/)) {
                        var cgid = Number(result[1]);
                        doc.groups = doc.groups.filter(function (x) {
                            return x !== cgid;
                        });
                        _this.save(doc);
                        return;
                    } else if(result = returnValue.match(/^add;(\d+)$/)) {
                        var cgid = Number(result[1]);
                        if(doc.groups.indexOf(cgid) < 0) {
                            doc.groups.push(cgid);
                            _this.save(doc);
                        }
                        return;
                    }
                }
                if(returnValue) {
                    _this.close(returnValue);
                }
            });
            c.appendChild(list.getContent());
            help(function (helpel) {
                helpel.appendChild(el("h1", function (h1) {
                    h1.textContent = "スケジューラの設定";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "上部ではスケジューラの名前を変更できます。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "服を登録するには、まず服グループを登録してその中に服を登録します。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "新しい服グループを追加したら、服グループの設定画面を開いて服を登録しましょう。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "服グループは、上と下の2つ作って登録するのがおすすめです。";
                }));
            });
        };
        SchedulerConfig.prototype.save = function (doc) {
            var _this = this;
            var db = this.db;
            db.setScheduler(doc, function (result) {
                _this.open();
            });
        };
        return SchedulerConfig;
    })(UISection);
    UI.SchedulerConfig = SchedulerConfig;    
    var DayVision = (function (_super) {
        __extends(DayVision, _super);
        function DayVision(db, scheduler) {
                _super.call(this);
            this.db = db;
            this.scheduler = scheduler;
        }
        DayVision.prototype.open = function (d) {
            var _this = this;
            var db = this.db, scheduler = this.scheduler;
            var c = this.getContent();
            scheduler.calculateScore(scheduler.logs, d, function (clothScores) {
                var mains = scheduler.doc.groups.slice(0, 2);
                var table = el("table", function (t) {
                    var table = t;
                    table.classList.add("dayvision-table");
                    var tr = table.insertRow(-1);
                    if(mains.length === 2) {
                        (function (td) {
                            td.colSpan = 2 , td.rowSpan = 2;
                        })(tr.insertCell(-1));
                    }
                    if(mains.length > 0) {
                        db.getClothGroup(mains[0], function (cgdoc1) {
                            var cloths1 = [];
                            db.eachCloth({
                                group: mains[0]
                            }, function (cdoc) {
                                if(cdoc) {
                                    cloths1.push(cdoc);
                                } else {
                                    if(mains.length > 1) {
                                        db.getClothGroup(mains[1], function (cgdoc2) {
                                            var cloths2 = [];
                                            db.eachCloth({
                                                group: mains[1]
                                            }, function (cdoc) {
                                                if(cdoc) {
                                                    cloths2.push(cdoc);
                                                } else {
                                                    if(cloths1.length > 0 && cloths2.length > 0) {
                                                        tr.appendChild(el("th", function (thh) {
                                                            var th = thh;
                                                            th.colSpan = cloths1.length;
                                                            th.textContent = cgdoc1.name;
                                                        }));
                                                        var c1col = [];
                                                        (function (tr) {
                                                            cloths1.forEach(function (cdoc1, i) {
                                                                c1col[i] = Cloth.importCloth(cdoc1);
                                                                (function (td) {
                                                                    td.appendChild(selectbox.cloth(cdoc1, {
                                                                        size: "24px"
                                                                    }, function (mode) {
                                                                        _this.close("cloth::" + cdoc1.id);
                                                                    }));
                                                                })(tr.insertCell(-1));
                                                            });
                                                        })(table.insertRow(-1));
                                                        cloths2.forEach(function (cdoc2, i) {
                                                            var tr = table.insertRow(-1);
                                                            if(i === 0) {
                                                                tr.appendChild(el("th", function (thh) {
                                                                    var th = thh;
                                                                    th.rowSpan = cloths2.length;
                                                                    th.textContent = cgdoc2.name;
                                                                    th.classList.add("vertical-th");
                                                                }));
                                                            }
                                                            var c2svg = Cloth.importCloth(cdoc2);
                                                            (function (td) {
                                                                td.appendChild(selectbox.cloth(cdoc2, {
                                                                    size: "24px"
                                                                }, function (mode) {
                                                                    _this.close("cloth::" + cdoc2.id);
                                                                }));
                                                            })(tr.insertCell(-1));
                                                            cloths1.forEach(function (cdoc1, j) {
                                                                (function (td) {
                                                                    td.appendChild(c1col[j].getSVG("32px", "32px"));
                                                                    td.appendChild(c2svg.getSVG("32px", "32px"));
                                                                    td.classList.add("cloth-option");
                                                                    var cloths = [
                                                                        cdoc1.id, 
                                                                        cdoc2.id
                                                                    ];
                                                                    cloths.sort();
                                                                    var clothstr = JSON.stringify(cloths);
                                                                    if(clothScores[clothstr] > -Infinity) {
                                                                        td.dataset.clotharray = clothstr;
                                                                    } else {
                                                                        td.classList.add("unavailable");
                                                                    }
                                                                })(tr.insertCell(-1));
                                                            });
                                                        });
                                                    }
                                                }
                                            });
                                        });
                                    } else {
                                        if(cloths1.length > 0) {
                                            tr.appendChild(el("th", function (thh) {
                                                var th = thh;
                                                th.colSpan = cloths1.length;
                                                th.textContent = cgdoc1.name;
                                            }));
                                            (function (tr) {
                                                cloths1.forEach(function (cloth) {
                                                    (function (td) {
                                                        td.appendChild(Cloth.importCloth(cloth).getSVG("32px", "32px"));
                                                        td.classList.add("cloth-option");
                                                        if(clothScores["[" + cloth.id + "]"] > -Infinity) {
                                                            td.dataset.clotharray = "[" + cloth.id + "]";
                                                        } else {
                                                            td.classList.add("unavailable");
                                                        }
                                                    })(tr.insertCell(-1));
                                                });
                                            })(table.insertRow(-1));
                                        }
                                    }
                                }
                            });
                        });
                    }
                });
                empty(c);
                c.classList.add("limit-width");
                c.appendChild(el("h1", function (h1) {
                    h1.textContent = (d.getMonth() + 1) + "月" + d.getDate() + "日の服を選択";
                }));
                c.appendChild(table);
                table.addEventListener("click", function (e) {
                    var node = e.target;
                    do {
                        if(node.classList && node.classList.contains("cloth-option")) {
                            if(!node.classList.contains("unavailable")) {
                                var modal = new ModalUI(_this);
                                var ddc = new DayDecision(db, scheduler);
                                ddc.open(d, JSON.parse(node.dataset.clotharray));
                                modal.slide("simple", ddc, function (returnValue) {
                                    if(returnValue) {
                                        _this.close(returnValue);
                                    }
                                });
                            }
                        }
                    }while(node = node.parentNode);
                }, false);
                c.appendChild(el("section", function (section) {
                    console.log(clothScores);
                    var combs = Object.keys(clothScores);
                    if(combs.length > 0) {
                        combs.sort(function (a, b) {
                            return clothScores[b] - clothScores[a];
                        });
                        combs = combs.filter(function (x) {
                            return clothScores[x] === clothScores[combs[0]];
                        });
                        console.log(combs);
                        var osusume = JSON.parse(combs[Math.floor(combs.length * Math.random())]);
                        console.log(osusume);
                        section.appendChild(el("h1", function (h1) {
                            h1.textContent = "おすすめの組み合わせ";
                        }));
                        section.appendChild(el("div", function (div) {
                            div.classList.add("cloth-option");
                            db.getClothes(osusume, function (cdocs) {
                                cdocs.forEach(function (cdoc) {
                                    div.appendChild(Cloth.importCloth(cdoc).getSVG("32px", "32px"));
                                });
                            });
                            div.addEventListener("click", function (e) {
                                var modal = new ModalUI(_this);
                                var ddc = new DayDecision(db, scheduler);
                                ddc.open(d, osusume);
                                modal.slide("simple", ddc, function (returnValue) {
                                    if(returnValue) {
                                        _this.close(returnValue);
                                    }
                                });
                            }, false);
                        }));
                    }
                }));
            });
            help(function (helpel) {
                helpel.appendChild(el("h1", function (h1) {
                    h1.textContent = "服の選択";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "服を選択する画面では、服の候補一覧が表示されています。クリックすると選択できます。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "まだ服を登録していない場合は何も表示されないので、先に服グループと服を登録しましょう。";
                }));
            });
        };
        return DayVision;
    })(UISection);
    UI.DayVision = DayVision;    
    var DayDecision = (function (_super) {
        __extends(DayDecision, _super);
        function DayDecision(db, scheduler) {
                _super.call(this);
            this.db = db;
            this.scheduler = scheduler;
        }
        DayDecision.prototype.open = function (d, cloth) {
            var _this = this;
            var original_cloth = cloth;
            cloth = cloth.concat([]);
            d = zeroDate(d);
            var db = this.db, scheduler = this.scheduler;
            var c = this.getContent();
            empty(c);
            c.appendChild(el("h1", function (h1) {
                h1.textContent = (d.getMonth() + 1) + "月" + d.getDate() + "日の服装";
            }));
            var groups = scheduler.doc.groups;
            var clothdocs = [];
            var getCloth;
            (getCloth = function (index) {
                db.getCloth(cloth[index], function (cdoc) {
                    if(cdoc) {
                        clothdocs[index] = cdoc;
                        if(index < cloth.length - 1) {
                            getCloth(index + 1);
                            return;
                        }
                    }
                    var button = el("button", function (button) {
                        button.textContent = (d.getMonth() + 1) + "月" + d.getDate() + "日の服を登録";
                    });
                    groups.forEach(function (x) {
                        c.appendChild(el("section", function (section) {
                            db.getClothGroup(x, function (cgdoc) {
                                section.appendChild(el("h1", function (h1) {
                                    h1.appendChild(icons.clothgroup({
                                        width: "32px",
                                        height: "32px"
                                    }));
                                    h1.appendChild(document.createTextNode(cgdoc.name));
                                }));
                                for(var i = 0, l = clothdocs.length; i < l; i++) {
                                    if(cloth[i] != null && clothdocs[i].group.indexOf(cgdoc.id) >= 0) {
                                        section.appendChild(el("div", function (div) {
                                            div.appendChild(Cloth.importCloth(clothdocs[i]).getSVG("48px", "48px"));
                                        }));
                                        cloth[i] = null;
                                        break;
                                    }
                                }
                                if(i === l) {
                                    section.appendChild(el("p", function (p) {
                                        p.textContent = "服が未選択です。";
                                    }));
                                    section.appendChild(el("ul", function (div) {
                                        div.classList.add("choosecloth-field");
                                        db.eachCloth({
                                            group: cgdoc.id
                                        }, function (cdoc) {
                                            if(cdoc) {
                                                div.appendChild(el("li", function (div) {
                                                    div.dataset.cloth = String(cdoc.id);
                                                    div.appendChild(Cloth.importCloth(cdoc).getSVG("32px", "32px"));
                                                }));
                                            }
                                        });
                                        div.addEventListener("click", function (e) {
                                            var node = e.target;
                                            do {
                                                if(node.dataset && node.dataset.cloth) {
                                                    var newcloth = original_cloth.concat([
                                                        Number(node.dataset.cloth)
                                                    ]);
                                                    newcloth.sort();
                                                    _this.open(d, newcloth);
                                                    break;
                                                }
                                            }while(node = node.parentNode);
                                        }, false);
                                    }));
                                    button.disabled = true;
                                }
                            });
                        }));
                    });
                    c.appendChild(el("p", function (p) {
                        p.appendChild(button);
                        button.addEventListener("click", function (e) {
                            var newlog = {
                                id: null,
                                scheduler: scheduler.doc.id,
                                cloth: original_cloth,
                                date: d
                            };
                            delete newlog.id;
                            db.addupLog(newlog, function (result) {
                                _this.close("scheduler::open:" + newlog.scheduler);
                            });
                        }, false);
                    }));
                });
            })(0);
            help(function (helpel) {
                helpel.appendChild(el("h1", function (h1) {
                    h1.textContent = "服の選択";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "着る服を確認したら登録ボタンを押して下さい。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "3つ以上服グループがある場合は、この画面でさらに選択します。";
                }));
            });
        };
        return DayDecision;
    })(UISection);
    UI.DayDecision = DayDecision;    
    var DayLog = (function (_super) {
        __extends(DayLog, _super);
        function DayLog(db, scheduler) {
                _super.call(this);
            this.db = db;
            this.scheduler = scheduler;
        }
        DayLog.prototype.open = function (d) {
            var _this = this;
            var db = this.db, scheduler = this.scheduler, doc = scheduler.doc;
            var c = this.getContent();
            d = zeroDate(d);
            empty(c);
            c.appendChild(el("h1", function (h1) {
                h1.textContent = (d.getMonth() + 1) + "月" + d.getDate() + "日のログ";
            }));
            db.getClothGroups(doc.groups, function (cgdocs) {
                db.eachLog({
                    scheduler: doc.id,
                    date: {
                        start: d,
                        end: d
                    }
                }, function (ldoc) {
                    if(ldoc == null) {
                        return;
                    }
                    var cloth = ldoc.cloth.concat([]);
                    db.getClothes(cloth, function (cdocs) {
                        c.appendChild(el("div", function (div) {
                            cgdocs.forEach(function (cgdoc) {
                                for(var i = 0, l = cloth.length; i < l; i++) {
                                    if(cloth[i] != null && cdocs[i].group.indexOf(cgdoc.id) >= 0) {
                                        (function (cdoc) {
                                            div.appendChild(el("div", function (div) {
                                                div.classList.add("group-cloth-group");
                                                div.appendChild(selectbox.clothgroup(cgdoc, {
                                                    del: false
                                                }, function (mode) {
                                                    _this.close("clothgroup::id:" + cgdoc.id);
                                                }));
                                                div.appendChild(selectbox.cloth(cdoc, {
                                                    size: "96px"
                                                }, function (mode) {
                                                    _this.close("cloth::" + cdoc.id);
                                                }));
                                            }));
                                        })(cdocs[i]);
                                        cloth[i] = null;
                                        break;
                                    }
                                }
                            });
                        }));
                    });
                });
            });
        };
        return DayLog;
    })(UISection);
    UI.DayLog = DayLog;    
    var SchedulerContainer = (function (_super) {
        __extends(SchedulerContainer, _super);
        function SchedulerContainer(id, db) {
                _super.call(this);
            this.id = id;
            this.db = db;
        }
        SchedulerContainer.prototype.open = function (conf) {
            var _this = this;
            UI.Scheduler.getScheduler(this.db, this.id, function (result) {
                var c = _this.getContent();
                c.classList.add("scheduler-container");
                while(c.firstChild) {
                    c.removeChild(c.firstChild);
                }
                if(result) {
                    _this.id = result.doc.id;
                    localStorage.setItem("lastScheduler", String(_this.id));
                    result.setDate(new Date());
                    c.appendChild(result.getContent());
                    result.onclose(function (returnValue) {
                        _this.close(returnValue);
                    });
                    if(conf) {
                        var modal = new ModalUI(result);
                        var setting = new SchedulerConfig(_this.db, result);
                        modal.slide("simple", setting, function (returnValue) {
                            _this.close("scheduler::open:" + _this.id);
                        });
                    }
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
    var SchedulerList = (function (_super) {
        __extends(SchedulerList, _super);
        function SchedulerList(db, option) {
                _super.call(this);
            this.db = db;
            var c = this.getContent();
            this.open();
        }
        SchedulerList.prototype.open = function () {
            var _this = this;
            var c = this.getContent();
            empty(c);
            c.appendChild(el("h1", function (h1) {
                h1.textContent = "全てのスケジューラ";
            }));
            c.classList.add("scheduler-list");
            var count = 0;
            this.db.eachScheduler({
            }, function (doc) {
                if(doc == null) {
                    if(count === 0) {
                        c.appendChild(el("p", function (p) {
                            p.textContent = "スケジューラはありません。";
                        }));
                    }
                    c.appendChild(el("button", function (button) {
                        button.appendChild(icons.plus({
                            color: "#666666",
                            width: "24px",
                            height: "24px"
                        }));
                        button.appendChild(document.createTextNode("新しいスケジューラを作成"));
                        button.addEventListener("click", function (e) {
                            var nsc = {
                                id: Infinity,
                                type: "calender",
                                name: "新しいスケジューラ",
                                made: new Date(),
                                groups: []
                            };
                            delete nsc.id;
                            _this.db.setScheduler(nsc, function (id) {
                                nsc.id = id;
                                _this.close("scheduler::conf:" + id);
                            });
                        }, false);
                        count++;
                    }));
                    return;
                }
                c.appendChild(selectbox.scheduler(doc, {
                    del: true
                }, function (mode) {
                    if(mode === "normal") {
                        _this.close("scheduler::open:" + doc.id);
                    } else if(mode === "delete") {
                        var res = window.confirm("スケジューラを削除しますか?この操作は元に戻せません。\n\nスケジューラを削除しても、服や服グループのデータは削除されません。");
                        if(res) {
                            _this.db.cleanupScheduler(doc.id, function (result) {
                                _this.open();
                            });
                        }
                    }
                }));
            });
            help();
        };
        return SchedulerList;
    })(UISection);
    UI.SchedulerList = SchedulerList;    
    var ClothGroupListContainer = (function (_super) {
        __extends(ClothGroupListContainer, _super);
        function ClothGroupListContainer(db) {
            var _this = this;
                _super.call(this);
            this.db = db;
            var c = this.getContent();
            var optobj = {
                add: true,
                selectadd: false,
                del: true
            };
            var list = new ClothGroupList(db, optobj);
            c.appendChild(list.getContent());
            list.onclose(function (returnValue) {
                if("string" === typeof returnValue) {
                    var result = returnValue.match(/^(\w+);(\d+)$/);
                    if(result) {
                        switch(result[1]) {
                            case "select":
                                _this.close("clothgroup::id:" + result[2]);
                                break;
                            case "delete":
                                var res = window.confirm("服グループを削除しますか?\nこの動作は取り消せません。\n\n服グループを削除しても、所属する服は削除されません。");
                                if(res) {
                                    db.cleanupClothGroup(Number(result[2]), function (result) {
                                        list.open(db, optobj);
                                    });
                                }
                                break;
                            case "add":
                                list.open(db, optobj);
                                break;
                        }
                        return;
                    }
                }
                _this.close(returnValue);
            });
        }
        return ClothGroupListContainer;
    })(UIObject);
    UI.ClothGroupListContainer = ClothGroupListContainer;    
    var ClothGroupList = (function (_super) {
        __extends(ClothGroupList, _super);
        function ClothGroupList(db, option) {
                _super.call(this);
            this.db = db;
            if(!option) {
                option = {
                };
            }
            this.open(db, option);
        }
        ClothGroupList.prototype.open = function (db, option) {
            var _self = this;
            var c = this.getContent();
            c.classList.add("clothgroup-list");
            empty(c);
            var count = 0;
            if(option.schedulerid != null) {
                db.getScheduler(option.schedulerid, function (schedulerdoc) {
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
                    c.appendChild(selectbox.clothgroup(doc, {
                        del: !!option.del
                    }, function (mode) {
                        if(mode === "normal") {
                            _self.close("select;" + doc.id);
                        } else if(mode === "delete") {
                            _self.close("delete;" + doc.id);
                        }
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
                if(option.selectadd) {
                    c.appendChild(el("p", function (p) {
                        p.appendChild(el("button", function (b) {
                            var button = b;
                            button.appendChild(icons.plus({
                                color: "#666666",
                                width: "24px",
                                height: "24px"
                            }));
                            button.appendChild(document.createTextNode("既存の服グループを追加"));
                            button.addEventListener("click", function (e) {
                                var modal = new ModalUI(_self);
                                var list2 = new ClothGroupList(db, {
                                    add: false,
                                    del: false
                                });
                                modal.slide("simple", list2, function (returnValue) {
                                    if("string" === typeof returnValue) {
                                        var result = returnValue.match(/^(\w+);(\d+)$/);
                                        if(result && result[1] === "select") {
                                            _self.close("add;" + result[2]);
                                            return;
                                        }
                                    }
                                    if(returnValue) {
                                        _self.close(returnValue);
                                    }
                                });
                            }, false);
                        }));
                    }));
                }
                if(option.add) {
                    c.appendChild(el("p", function (p) {
                        p.appendChild(el("button", function (b) {
                            var button = b;
                            button.appendChild(icons.plus({
                                color: "#666666",
                                width: "24px",
                                height: "24px"
                            }));
                            button.appendChild(document.createTextNode("新しい服グループを作成して追加"));
                            button.addEventListener("click", function (e) {
                                var modal = new ModalUI(_self);
                                var info = new NewClothGroup(db, option.schedulerid);
                                modal.slide("simple", info, function (returnValue) {
                                    if(returnValue != null) {
                                        if("number" === typeof returnValue) {
                                            _self.close("add;" + returnValue);
                                        } else {
                                            _self.close(returnValue);
                                        }
                                    }
                                });
                            }, false);
                        }));
                    }));
                }
            }
        };
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
            help(function (helpel) {
                helpel.appendChild(el("h1", function (h1) {
                    h1.textContent = "服グループの設定";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "服グループの設定では、名前の変更や所属するスケジューラの確認・服の登録ができます。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "服グループを作ったばかりの場合は、まず服を登録しましょう。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "服グループを削除する場合は、上部メニューの服グループの一覧から削除して下さい。";
                }));
            });
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
                                if(id != null) {
                                    doc.id = id;
                                    _self.clothgroupid = id;
                                    if(schedulerid != null) {
                                        db.getScheduler(schedulerid, function (schedulerdoc) {
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
                        section.appendChild(selectbox.scheduler(sdoc, {
                            del: true
                        }, function (mode) {
                            if(mode === "normal") {
                                _self.close("scheduler::open:" + sdoc.id);
                            } else if(mode === "delete") {
                                sdoc.groups = sdoc.groups.filter(function (x) {
                                    return x !== doc.id;
                                });
                                db.setScheduler(sdoc, function (result) {
                                    _self.open();
                                });
                            }
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
                                        var modal = new ModalUI(_self);
                                        var sel = new ClothSelect(null);
                                        modal.slide("simple", sel, function (returnValue) {
                                            if(returnValue != null) {
                                                if(returnValue.mode === "save") {
                                                    var clothd = {
                                                        id: null,
                                                        name: "",
                                                        type: returnValue.doc.type,
                                                        patterns: returnValue.doc.patterns,
                                                        group: [
                                                            doc.id
                                                        ],
                                                        used: 0,
                                                        status: "active",
                                                        made: new Date(),
                                                        lastuse: null
                                                    };
                                                    delete clothd.id;
                                                    db.setCloth(clothd, function (result) {
                                                        if(result != null) {
                                                            clothd.id = result;
                                                            _self.close("cloth::" + result);
                                                        }
                                                    });
                                                    return;
                                                }
                                                _self.close(returnValue);
                                            }
                                        });
                                    }, false);
                                }));
                            }));
                            return;
                        }
                        section.appendChild(selectbox.cloth(cdoc, null, function (mode) {
                            _self.close("cloth::" + cdoc.id);
                        }));
                        count++;
                    });
                }));
            }
        };
        return ClothGroupInfo;
    })(UISection);
    UI.ClothGroupInfo = ClothGroupInfo;    
    var NewClothGroup = (function (_super) {
        __extends(NewClothGroup, _super);
        function NewClothGroup(db, schedulerid) {
            var _this = this;
                _super.call(this);
            this.db = db;
            var c = this.getContent();
            c.appendChild(el("h1", function (h1) {
                h1.appendChild(icons.clothgroup({
                    width: "32px",
                    height: "32px"
                }));
                h1.appendChild(document.createTextNode("新しい服グループを作成する"));
            }));
            c.appendChild(el("form", function (f) {
                var form = f;
                form.appendChild(el("p", function (p) {
                    p.textContent = "名前:";
                    p.appendChild(el("input", function (i) {
                        var input = i;
                        input.name = "name";
                        input.size = 30;
                        input.placeholder = "名前を入力";
                        input.value = "新しい服グループ";
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
                    var doc = {
                        id: null,
                        name: name,
                        made: new Date()
                    };
                    delete doc.id;
                    db.setClothGroup(doc, function (id) {
                        if(id != null) {
                            doc.id = id;
                            if(schedulerid != null) {
                                db.getScheduler(schedulerid, function (schedulerdoc) {
                                    if(schedulerdoc) {
                                        if(schedulerdoc.groups.indexOf(id) < 0) {
                                            schedulerdoc.groups.push(id);
                                            db.setScheduler(schedulerdoc, function (result) {
                                                _this.close(id);
                                            });
                                        }
                                    }
                                });
                            } else {
                                _this.close(id);
                            }
                        } else {
                            _this.close(null);
                        }
                    });
                }, false);
            }));
        }
        return NewClothGroup;
    })(UISection);
    UI.NewClothGroup = NewClothGroup;    
    var ClothSelect = (function (_super) {
        __extends(ClothSelect, _super);
        function ClothSelect(doc) {
            var _this = this;
                _super.call(this);
            this.doc = doc;
            var c = this.getContent();
            c.appendChild(el("h1", function (h1) {
                h1.textContent = "服エディタ";
            }));
            c.appendChild(el("div", function (div) {
                div.classList.add("clothselect-container");
                div.appendChild(el("div", function (div) {
                    div.classList.add("clothselect-typeselect");
                    Cloth.clothTypes.forEach(function (obj) {
                        var sample = Cloth.importCloth({
                            type: obj.type,
                            patterns: []
                        });
                        div.appendChild(el("div", function (div) {
                            div.classList.add("clothselect-typebox");
                            div.dataset.type = obj.type;
                            div.appendChild(sample.getSVG("48px", "48px"));
                        }));
                    });
                    div.addEventListener("click", function (e) {
                        var t = e.target;
                        var node = t;
                        var patternIndex = null;
                        do {
                            var el = node;
                            if(el.classList && el.classList.contains("clothselect-typebox")) {
                                _this.doc.type = el.dataset.type;
                                _this.setType();
                                break;
                            }
                        }while(node = node.parentNode);
                    }, false);
                }));
                div.appendChild(el("div", function (div) {
                    _this.previewArea = div;
                    div.classList.add("clothselect-previewbox");
                    div.addEventListener("click", function (e) {
                        var t = e.target;
                        var node = t;
                        var patternIndex = null;
                        do {
                            var el = node;
                            var fi = el.getAttribute("fill");
                            if(fi) {
                                var result = fi.match(/^url\(#cloth(\d+)-pattern(\d+)\)$/);
                                if(result) {
                                    patternIndex = parseInt(result[2]);
                                    break;
                                }
                            }
                        }while(node = node.parentNode);
                        if(patternIndex != null) {
                            _this.editPattern(patternIndex);
                        }
                    }, false);
                }));
                div.appendChild(el("div", function (div) {
                    _this.mainArea = div;
                    div.textContent = "服をクリック/タップして服の模様を編集して下さい。";
                }));
                div.appendChild(el("div", function (div) {
                    div.classList.add("clothselect-patternselect");
                    Cloth.patternTypes.forEach(function (obj, i) {
                        div.appendChild(el("div", function (div) {
                            div.classList.add("clothselect-patternbox");
                            div.dataset.type = obj.type;
                            div.appendChild(svg("svg", function (v) {
                                var vg = v;
                                vg.setAttribute("version", "1.1");
                                vg.width.baseVal.valueAsString = "48px";
                                vg.height.baseVal.valueAsString = "48px";
                                vg.viewBox.baseVal.x = 0 , vg.viewBox.baseVal.y = 0 , vg.viewBox.baseVal.width = 96 , vg.viewBox.baseVal.height = 96;
                                var patt = Cloth.makePattern({
                                    type: obj.type,
                                    size: obj.defaultSize,
                                    colors: Cloth.defaultColors.slice(0, obj.colorNumber)
                                });
                                patt.id = "patternbox" + i + "-pattern";
                                vg.appendChild(patt);
                                vg.appendChild(svg("rect", function (r) {
                                    var rect = r;
                                    rect.setAttribute("stroke", "#000000");
                                    rect.setAttribute("stroke-width", "2px");
                                    rect.x.baseVal.valueAsString = "0px";
                                    rect.y.baseVal.valueAsString = "0px";
                                    rect.width.baseVal.valueAsString = "96";
                                    rect.height.baseVal.valueAsString = "96";
                                    rect.setAttribute("fill", "url(#patternbox" + i + "-pattern)");
                                }));
                            }));
                        }));
                    });
                    div.addEventListener("click", function (e) {
                        var node = e.target;
                        do {
                            if(node.classList && node.classList.contains("clothselect-patternbox")) {
                                var patype = node.dataset.type;
                                var pato = Cloth.patternTypes.filter(function (x) {
                                    return x.type === patype;
                                })[0];
                                var pat = _this.doc.patterns[_this.editingIndex];
                                pat.type = patype;
                                while(pat.colors.length < pato.colorNumber) {
                                    pat.colors[pat.colors.length] = Cloth.defaultColors[pat.colors.length];
                                }
                                pat.size = pato.defaultSize;
                                _this.changePattern(_this.editingIndex, pat);
                                _this.editPattern(_this.editingIndex);
                            }
                        }while(node = node.parentNode);
                    }, false);
                }));
            }));
            c.appendChild(el("p", function (p) {
                p.appendChild(el("button", function (b) {
                    var button = b;
                    button.textContent = "服を保存";
                    button.addEventListener("click", function (e) {
                        _this.close({
                            mode: "save",
                            doc: _this.doc
                        });
                    }, false);
                }));
                p.appendChild(el("button", function (b) {
                    var button = b;
                    button.textContent = "キャンセル";
                    button.addEventListener("click", function (e) {
                        _this.close({
                            mode: "cancel"
                        });
                    }, false);
                }));
            }));
            if(!doc) {
                doc = this.doc = {
                    type: "UT-shirt",
                    patterns: []
                };
            }
            this.setType();
            help(function (helpel) {
                helpel.appendChild(el("h1", function (h1) {
                    h1.textContent = "服エディタ";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "服エディタでは服のデザインを決めることができます。実際の服に近いデザインにするとわかりやすくなります。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "一番左のメニューから服の種類を決めましょう。決めたら右に大きな服の画像が出現します。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "色や模様を変えたいときは、服のその部分をクリックします。右に色選択画面が出現するので、色を変更しましょう。その右には模様選択があります。模様をクリックするとその模様になります。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "編集が終わったら服を保存ボタンを押します。";
                }));
            });
        }
        ClothSelect.prototype.setType = function () {
            var _this = this;
            empty(this.previewArea);
            this.cloth = Cloth.importCloth(this.doc);
            var pats = this.doc.patterns;
            var tytyty = Cloth.clothTypes.filter(function (x) {
                return x.type === _this.doc.type;
            })[0];
            while(pats.length < tytyty.patternNumber) {
                pats[pats.length] = {
                    type: "simple",
                    size: 0,
                    deg: 0,
                    colors: [
                        Cloth.defaultColors[pats.length]
                    ]
                };
            }
            this.previewArea.appendChild(this.cloth.getSVG("128px", "128px"));
            this.editPattern(0);
        };
        ClothSelect.prototype.changePattern = function (index, pat) {
            if(!this.cloth) {
                return;
            }
            var vg = this.previewArea.getElementsByTagNameNS(Cloth.svgNS, "svg")[0];
            Cloth.changePattern(index, pat, vg);
            vg = this.mainArea.getElementsByTagNameNS(Cloth.svgNS, "svg")[0];
            var patt = vg.getElementById("preview-pattern");
            var newpatt = Cloth.makePattern(pat);
            newpatt.id = "preview-pattern";
            patt.parentNode.replaceChild(newpatt, patt);
        };
        ClothSelect.prototype.editPattern = function (index) {
            var _this = this;
            this.editingIndex = index;
            var main = this.mainArea;
            empty(main);
            var pat = this.doc.patterns[index];
            var tytyty = Cloth.patternTypes.filter(function (x) {
                return x.type === pat.type;
            })[0];
            while(pat.colors.length < tytyty.colorNumber) {
                pat.colors[pat.colors.length] = Cloth.defaultColors[pat.colors.length];
            }
            var preview = svg("svg", function (v) {
                var vg = v;
                vg.setAttribute("version", "1.1");
                vg.width.baseVal.valueAsString = "96px";
                vg.height.baseVal.valueAsString = "96px";
                vg.viewBox.baseVal.x = 0 , vg.viewBox.baseVal.y = 0 , vg.viewBox.baseVal.width = 256 , vg.viewBox.baseVal.height = 256;
                var pattern = Cloth.makePattern(pat);
                pattern.id = "preview-pattern";
                vg.appendChild(pattern);
                vg.appendChild(svg("rect", function (r) {
                    var rect = r;
                    rect.setAttribute("stroke", "#000000");
                    rect.setAttribute("stroke-width", "2px");
                    rect.x.baseVal.valueAsString = "0px";
                    rect.y.baseVal.valueAsString = "0px";
                    rect.width.baseVal.valueAsString = "256px";
                    rect.height.baseVal.valueAsString = "256px";
                    rect.setAttribute("fill", "url(#preview-pattern)");
                }));
            });
            main.appendChild(el("div", function (div) {
                div.appendChild(preview);
            }));
            if(tytyty.requiresSize) {
                main.appendChild(el("div", function (div) {
                    div.textContent = "サイズ:";
                    div.appendChild(el("input", function (i) {
                        var input = i;
                        input.type = "range";
                        input.min = "1";
                        input.max = "128";
                        input.step = "1";
                        input.value = String(pat.size);
                        (function (input) {
                            input.addEventListener("change", function (e) {
                                pat.size = Number(input.value);
                                _this.changePattern(index, pat);
                            }, false);
                        })(input);
                    }));
                }));
            }
            if(tytyty.requiresDeg) {
                main.appendChild(el("div", function (div) {
                    div.textContent = "角度:";
                    div.appendChild(el("input", function (i) {
                        var input = i;
                        input.type = "range";
                        input.min = "0";
                        input.max = "180";
                        input.step = "1";
                        input.value = String(pat.deg || 0);
                        (function (input) {
                            input.addEventListener("change", function (e) {
                                pat.deg = Number(input.value);
                                input.title = input.value + "°";
                                _this.changePattern(index, pat);
                            }, false);
                        })(input);
                    }));
                }));
            }
            for(var i = 0; i < tytyty.colorNumber; i++) {
                main.appendChild(el("div", function (div) {
                    var input;
                    div.textContent = "色" + (i + 1) + ":";
                    div.appendChild(input = el("input", function (inp) {
                        var input = inp;
                        input.type = "color";
                        input.value = pat.colors[i];
                    }));
                    (function (i, input) {
                        input.addEventListener("input", function (e) {
                            pat.colors[i] = input.value;
                            _this.changePattern(index, pat);
                        }, false);
                    })(i, input);
                }));
            }
        };
        return ClothSelect;
    })(UISection);
    UI.ClothSelect = ClothSelect;    
    var ClothInfo = (function (_super) {
        __extends(ClothInfo, _super);
        function ClothInfo(db, clothid) {
                _super.call(this);
            this.db = db;
            this.clothid = clothid;
            this.open();
        }
        ClothInfo.prototype.open = function () {
            var _this = this;
            var db = this.db, clothid = this.clothid;
            var c = this.getContent();
            c.classList.add("cloth-info");
            empty(c);
            db.getCloth(clothid, function (doc) {
                if(doc == null) {
                    c.appendChild(el("p", function (p) {
                        p.textContent = "この服の情報は取得できません。";
                    }));
                    return;
                }
                c.appendChild(el("h1", function (h1) {
                    h1.appendChild(Cloth.importCloth({
                        type: doc.type,
                        patterns: doc.patterns
                    }).getSVG("128px", "128px"));
                    h1.appendChild(document.createTextNode(doc.name ? doc.name + "の設定" : "設定"));
                }));
                c.appendChild(el("p", function (p) {
                    p.appendChild(el("button", function (b) {
                        b.textContent = "デザインを変更する";
                        b.addEventListener("click", function (e) {
                            var modal = new ModalUI(_this);
                            var sel = new ClothSelect({
                                type: doc.type,
                                patterns: doc.patterns
                            });
                            modal.slide("simple", sel, function (returnValue) {
                                if(returnValue != null) {
                                    if(returnValue.mode === "save") {
                                        doc.type = returnValue.doc.type;
                                        doc.patterns = returnValue.doc.patterns;
                                        _this.saveDoc(doc);
                                    }
                                }
                            });
                        }, false);
                    }));
                }));
                c.appendChild(el("form", function (f) {
                    var form = f;
                    form.appendChild(el("p", function (p) {
                        p.textContent = "服の名前（省略可能）:";
                        p.appendChild(el("input", function (i) {
                            var input = i;
                            input.size = 20;
                            input.name = "name";
                            input.placeholder = "名前";
                            input.value = doc.name || "";
                        }));
                        p.appendChild(el("input", function (i) {
                            var input = i;
                            input.type = "submit";
                            input.value = "保存";
                        }));
                        form.addEventListener("submit", function (e) {
                            e.preventDefault();
                            doc.name = (form.elements["name"]).value;
                            _this.saveDoc(doc);
                        });
                    }));
                }));
                c.appendChild(el("section", function (section) {
                    section.appendChild(el("h1", function (h1) {
                        h1.textContent = "情報";
                    }));
                    if(doc.status === "washer") {
                        section.appendChild(el("p", function (p) {
                            p.textContent = "洗濯機に入っています";
                        }));
                        section.appendChild(el("p", function (p) {
                            p.appendChild(el("button", function (button) {
                                button.appendChild(icons.washer({
                                    width: "28px",
                                    height: "28px"
                                }));
                                button.appendChild(document.createTextNode("洗濯機から出す"));
                                button.addEventListener("click", function (e) {
                                    doc.status = "active";
                                    db.setCloth(doc, function (result) {
                                        _this.open();
                                    });
                                }, false);
                            }));
                        }));
                    } else {
                        section.appendChild(el("p", function (p) {
                            if(doc.used > 0) {
                                p.textContent = "洗濯後" + doc.used + "回使用";
                            } else {
                                p.textContent = "洗濯後未使用";
                            }
                        }));
                        section.appendChild(el("p", function (p) {
                            p.appendChild(el("button", function (button) {
                                button.appendChild(icons.washer({
                                    width: "28px",
                                    height: "28px"
                                }));
                                button.appendChild(document.createTextNode("洗濯機に入れる"));
                                button.addEventListener("click", function (e) {
                                    doc.status = "washer";
                                    db.setCloth(doc, function (result) {
                                        _this.open();
                                    });
                                }, false);
                            }));
                        }));
                    }
                    if(doc.lastuse) {
                        section.appendChild(el("p", function (p) {
                            p.textContent = "最後に使用した日付:" + doc.lastuse.getFullYear() + "年" + (doc.lastuse.getMonth() + 1) + "月" + doc.lastuse.getDate() + "日";
                        }));
                    }
                }));
                c.appendChild(el("section", function (section) {
                    section.appendChild(el("h1", function (h1) {
                        h1.textContent = "所属する服グループの一覧";
                    }));
                    section.appendChild(el("div", function (div) {
                        var _self = _this, count = 0;
                        getone(0);
                        function getone(index) {
                            var nextid = doc.group[index];
                            if(nextid == null) {
                                if(count === 0) {
                                    div.appendChild(el("p", function (p) {
                                        p.textContent = "所属する服グループはありません。";
                                    }));
                                }
                                return;
                            }
                            db.getClothGroup(nextid, function (cgdoc) {
                                if(cgdoc) {
                                    div.appendChild(selectbox.clothgroup(cgdoc, {
                                        del: true
                                    }, function (mode) {
                                        if(mode === "normal") {
                                            var modal = new ModalUI(_self);
                                            var info = new ClothGroupInfo(db, cgdoc.id);
                                            modal.slide("simple", info, function (mode) {
                                                if(mode != null) {
                                                    _self.close(mode);
                                                }
                                            });
                                        } else if(mode === "delete") {
                                            doc.group = doc.group.filter(function (x) {
                                                return x !== cgdoc.id;
                                            });
                                            _self.saveDoc(doc);
                                        }
                                    }));
                                    count++;
                                }
                                getone(index + 1);
                            });
                        }
                    }));
                    section.appendChild(el("p", function (p) {
                        p.appendChild(el("button", function (b) {
                            var button = b;
                            button.appendChild(icons.plus({
                                color: "#666666",
                                width: "24px",
                                height: "24px"
                            }));
                            button.appendChild(document.createTextNode("服グループを追加"));
                            button.addEventListener("click", function (e) {
                                var modal = new ModalUI(_this);
                                var list = new ClothGroupList(db, {
                                    del: false
                                });
                                modal.slide("simple", list, function (returnValue) {
                                    if("string" === typeof returnValue) {
                                        var result = returnValue.match(/^select;(\d+)$/);
                                        if(result) {
                                            var grid = Number(result[1]);
                                            if(doc.group.indexOf(grid) < 0) {
                                                doc.group.push(grid);
                                                _this.saveDoc(doc);
                                            }
                                        }
                                    }
                                });
                            }, false);
                        }));
                    }));
                }));
            });
            help(function (helpel) {
                helpel.appendChild(el("h1", function (h1) {
                    h1.textContent = "服の設定";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "服の設定では、服のデザインを変えたり服を洗濯機に入れたりできます。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "洗濯機に入れた服は、上のメニューから洗濯機の画面を開くと洗うことができます。洗った服は使用回数が0回に戻ります。";
                }));
            });
        };
        ClothInfo.prototype.saveDoc = function (doc, callback) {
            var _this = this;
            this.db.setCloth(doc, function (result) {
                if(callback) {
                    callback();
                } else {
                    _this.open();
                }
            });
        };
        return ClothInfo;
    })(UISection);
    UI.ClothInfo = ClothInfo;    
    var Washer = (function (_super) {
        __extends(Washer, _super);
        function Washer(db) {
                _super.call(this);
            this.db = db;
        }
        Washer.prototype.open = function () {
            var _this = this;
            var db = this.db;
            var c = this.getContent();
            empty(c);
            c.appendChild(el("h1", function (h1) {
                h1.appendChild(icons.washer({
                    width: "48px",
                    height: "48px"
                }));
                h1.appendChild(document.createTextNode("洗濯機"));
            }));
            c.appendChild(el("section", function (section) {
                section.appendChild(el("h1", function (h1) {
                    h1.textContent = "洗濯機の中にある服の一覧";
                }));
                var count = 0;
                db.eachCloth({
                    status: "washer"
                }, function (cdoc) {
                    if(cdoc == null) {
                        if(count === 0) {
                            section.appendChild(el("p", function (p) {
                                p.textContent = "服は入っていません。";
                            }));
                        } else {
                            section.appendChild(el("p", function (p) {
                                p.appendChild(el("button", function (button) {
                                    button.textContent = "洗う";
                                    button.title = "洗うと服の使用回数が0回に戻ります。";
                                    button.addEventListener("click", function (e) {
                                        var count2 = 0;
                                        db.eachCloth({
                                            status: "washer"
                                        }, function (cdoc) {
                                            if(cdoc == null) {
                                                return;
                                            }
                                            cdoc.status = "active";
                                            cdoc.used = 0;
                                            db.setCloth(cdoc, function (result) {
                                                count2++;
                                                if(count === count2) {
                                                    _this.open();
                                                }
                                            });
                                        });
                                    }, false);
                                }));
                            }));
                        }
                        return;
                    }
                    section.appendChild(selectbox.cloth(cdoc, {
                        size: "64px"
                    }, function (mode) {
                        _this.close("cloth::" + cdoc.id);
                    }));
                    count++;
                });
            }));
            help(function (helpel) {
                helpel.appendChild(el("h1", function (h1) {
                    h1.textContent = "洗濯機";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "洗濯機に入っている服は着ることができません。";
                }));
                helpel.appendChild(el("p", function (p) {
                    p.textContent = "洗うと服の使用回数が0回に戻ります。使用回数が少ない服のほうがおすすめされやすくなります。";
                }));
            });
        };
        return Washer;
    })(UISection);
    UI.Washer = Washer;    
    var Startup = (function (_super) {
        __extends(Startup, _super);
        function Startup() {
            var _this = this;
                _super.call(this);
            var c = this.getContent();
            c.appendChild(el("h1", function (h1) {
                h1.textContent = "nanikiruへようこそ!";
            }));
            c.appendChild(el("p", function (p) {
                p.textContent = "nanikiruは服装管理アプリケーションです。服を登録して毎日の服を記録管理でき、今日のおすすめの服も教えてくれます。";
            }));
            c.appendChild(el("section", function (section) {
                section.appendChild(el("h1", function (h1) {
                    h1.textContent = "自己アピール（人となり）";
                }));
                section.appendChild(el("p", function (p) {
                    p.innerHTML = "nanikiruを使って<strong>少ないリソース（服）を有効利用</strong>できる人です。今日はどの服を着るか迷う必要もなく<strong>時間も節約</strong>できる人です。";
                }));
                section.appendChild(el("p", function (p) {
                    p.innerHTML = "またnanikiruには<strong>他人と服を共有する機能はありません</strong>。これは<strong>他人に流されず自分の意見をしっかり持つ人</strong>ということを表しているのです。";
                }));
            }));
            c.appendChild(el("section", function (section) {
                section.appendChild(el("h1", function (h1) {
                    h1.textContent = "自己アピール（スキル）";
                }));
                section.appendChild(el("p", function (p) {
                    p.innerHTML = "画像を一切使わずに、多様な服アイコンを作成可能。服アイコンは<b>SVG</b>で表しています。データは<b>IndexedDB</b>で保存。";
                }));
            }));
            c.appendChild(el("section", function (section) {
                section.appendChild(el("h1", function (h1) {
                    h1.textContent = "動作環境";
                }));
                section.appendChild(el("p", function (p) {
                    p.innerHTML = "nanikiruは、<strong>モダンブラウザ</strong>なら動きます。モダンブラウザとは、ここではHTML5をはじめとする各種技術に十分対応したブラウザとします。スマートフォン・タブレットでも、モダンブラウザ搭載なら動きます。";
                }));
            }));
            c.appendChild(el("p", function (p) {
                p.appendChild(el("button", function (button) {
                    button.textContent = "nanikiruを利用開始する";
                    button.addEventListener("click", function (e) {
                        localStorage.setItem("startup", "done");
                        _this.close("scheduler::open:");
                    }, false);
                }));
            }));
        }
        return Startup;
    })(UISection);
    UI.Startup = Startup;    
    var Config = (function (_super) {
        __extends(Config, _super);
        function Config(db) {
                _super.call(this);
            this.db = db;
        }
        Config.prototype.open = function () {
            var _this = this;
            var db = this.db;
            var c = this.getContent();
            empty(c);
            c.appendChild(el("h1", function (h1) {
                h1.textContent = "設定";
            }));
            if(localStorage.getItem("nohelp") === "true") {
                c.appendChild(el("section", function (section) {
                    section.appendChild(el("h1", function (h1) {
                        h1.textContent = "ヘルプの復活";
                    }));
                    section.appendChild(el("p", function (p) {
                        p.textContent = "ヘルプを消してしまったが再び見たいという場合は復活ボタンを押して下さい。";
                    }));
                    section.appendChild(el("p", function (p) {
                        p.appendChild(el("button", function (button) {
                            button.textContent = "復活";
                            button.addEventListener("click", function (e) {
                                localStorage.removeItem("nohelp");
                                _this.open();
                            }, false);
                        }));
                    }));
                }));
            }
            c.appendChild(el("section", function (section) {
                section.appendChild(el("h1", function (h1) {
                    h1.textContent = "データインポート・エクスポート";
                }));
                section.appendChild(el("p", function (p) {
                    p.textContent = "他のブラウザにデータを移したい場合は、データをJSONファイルにエクスポートすることが可能です。エクスポートしたデータはインポートすることで復活できます。";
                }));
                section.appendChild(el("p", function (p) {
                    p.textContent = "インポーﾄ・エクスポートには時間がかかる可能性があります。インポートする場合はファイルを選択して下さい。";
                }));
                section.appendChild(el("p", function (p) {
                    p.appendChild(el("button", function (button) {
                        button.textContent = "エクスポート";
                        button.addEventListener("click", function (e) {
                            db.exportData(function (data) {
                                if(data == null) {
                                    return;
                                }
                                var objstr = JSON.stringify(data);
                                var a = el("a", function (an) {
                                    var a = an;
                                    a.download = "nanikiru.json";
                                    a.href = "data:application/json;charset=UTF-8," + encodeURIComponent(objstr);
                                });
                                a.click();
                            });
                        }, false);
                    }));
                }));
                section.appendChild(el("p", function (p) {
                    var file;
                    p.appendChild(file = el("input", function (i) {
                        var input = i;
                        input.type = "file";
                        input.required = true;
                        input.accept = ".json";
                    }));
                    p.appendChild(el("button", function (button) {
                        button.textContent = "インポート";
                        button.disabled = true;
                        button.addEventListener("click", function (e) {
                            var f = file.files[0];
                            if(!f) {
                                return;
                            }
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                console.log(reader.result);
                                var obj = null;
                                try  {
                                    obj = JSON.parse(reader.result);
                                } catch (e) {
                                    alert("ファイルがパースできませんでした。ファイルが間違っているか、壊れている可能性があります。");
                                }
                                console.log(obj);
                                db.importData(obj, function (result) {
                                    if(result === false) {
                                        alert("データをインポートできませんでした。ファイルが壊れている可能性があります。");
                                        return;
                                    }
                                    section.appendChild(el("p", function (p) {
                                        p.textContent = "データのインポートに成功しました。";
                                    }));
                                });
                            };
                            reader.readAsText(f);
                        }, false);
                        file.addEventListener("change", function (e) {
                            if(file.files[0]) {
                                button.disabled = false;
                            } else {
                                button.disabled = true;
                            }
                        }, false);
                    }));
                }));
            }));
        };
        return Config;
    })(UISection);
    UI.Config = Config;    
    var Dialog = (function (_super) {
        __extends(Dialog, _super);
        function Dialog(title, message, buttons) {
            var _this = this;
                _super.call(this);
            this.title = title;
            this.message = message;
            this.buttons = buttons;
            var c = this.getContent();
            c.classList.add("dialog-content");
            c.appendChild(el("h1", function (h1) {
                h1.textContent = title;
            }));
            c.appendChild(el("p", function (p) {
                p.textContent = message;
            }));
            c.appendChild(el("p", function (p) {
                buttons.forEach(function (label) {
                    p.appendChild(el("button", function (b) {
                        var button = b;
                        button.textContent = Dialog.labelText[label];
                        button.dataset.value = label;
                    }));
                });
                p.addEventListener("click", function (e) {
                    var target = e.target;
                    if(target.dataset.value) {
                        _this.close(target.dataset.value);
                    }
                }, false);
            }));
        }
        Dialog.prototype.show = function () {
            var d = document.createElement("dialog");
            d.appendChild(this.getContent());
            document.body.appendChild(d);
            d.showModal();
            this.onclose(function (returnValue) {
                d.close();
                document.body.removeChild(d);
            });
        };
        Dialog.labelText = {
            "ok": "OK",
            "yes": "はい",
            "no": "いいえ",
            "cancel": "キャンセル"
        };
        return Dialog;
    })(UISection);    
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu() {
            var _this = this;
                _super.call(this);
            var c = this.getContent();
            c.classList.add("menu");
            c.textContent = "メニュー:";
            c.appendChild(el("button", function (button) {
                button.textContent = "トップ";
                button.style.height = "32px";
                button.addEventListener("click", function (e) {
                    _this.close("scheduler::open:");
                }, false);
            }));
            c.appendChild(el("button", function (button) {
                button.classList.add("iconbutton");
                button.title = "スケジューラの一覧";
                button.appendChild(icons.calender({
                    width: "32px",
                    height: "32px"
                }));
                button.addEventListener("click", function (e) {
                    _this.close("schedulerlist::");
                }, false);
            }));
            c.appendChild(el("button", function (button) {
                button.classList.add("iconbutton");
                button.title = "全ての服グループ";
                button.appendChild(icons.clothgroup({
                    width: "32px",
                    height: "32px"
                }));
                button.addEventListener("click", function (e) {
                    _this.close("clothgroup::list:");
                }, false);
            }));
            c.appendChild(el("button", function (button) {
                button.classList.add("iconbutton");
                button.title = "洗濯機";
                button.appendChild(icons.washer({
                    width: "32px",
                    height: "32px"
                }));
                button.addEventListener("click", function (e) {
                    _this.close("washer::");
                }, false);
            }));
            c.appendChild(el("button", function (button) {
                button.classList.add("iconbutton");
                button.title = "設定";
                button.appendChild(icons.gear({
                    width: "32px",
                    height: "32px"
                }));
                button.addEventListener("click", function (e) {
                    _this.close("config::");
                }, false);
            }));
        }
        return Menu;
    })(UIObject);
    UI.Menu = Menu;    
    var ModalUI = (function () {
        function ModalUI(ui) {
            this.ui = ui;
            this.returnValue = void 0;
            this.helpdf = null;
            this.container = document.createElement("div");
            this.container.classList.add("modal-container");
            var c = ui.getContent();
            if(c.parentNode) {
                c.parentNode.replaceChild(this.container, c);
                this.container.appendChild(c);
            }
            var helpco = document.getElementsByClassName("helpco")[0];
            if(helpco.hasChildNodes()) {
                var range = document.createRange();
                range.selectNodeContents(helpco);
                this.helpdf = range.extractContents();
                range.detach();
            }
        }
        ModalUI.prototype.slide = function (mode, dia, callback) {
            var _this = this;
            this.dia = dia;
            var tc = this.container, bc = this.ui.getContent(), nc = dia.getContent();
            var helpco = document.getElementsByClassName("helpco")[0];
            if(mode === "simple") {
                bc.style.display = "none";
                tc.appendChild(nc);
                var p = el("p", function (p) {
                    p.appendChild(el("button", function (button) {
                        button.textContent = "戻る";
                        button.addEventListener("click", function (e) {
                            dia.close();
                        }, false);
                    }));
                });
                tc.appendChild(p);
                dia.onclose(function (returnValue) {
                    if(nc.parentNode === tc) {
                        tc.removeChild(nc);
                    }
                    if(p.parentNode === tc) {
                        tc.removeChild(p);
                    }
                    if(tc.parentNode) {
                        tc.parentNode.replaceChild(bc, tc);
                    }
                    bc.style.display = null;
                    if(_this.helpdf) {
                        var range = document.createRange();
                        range.selectNodeContents(helpco);
                        range.deleteContents();
                        helpco.appendChild(_this.helpdf);
                        range.detach();
                    }
                    if(callback) {
                        callback(returnValue);
                    }
                });
            }
        };
        return ModalUI;
    })();    
    function help(callback) {
        var helpel = document.getElementsByClassName("helpco")[0];
        empty(helpel);
        if(localStorage.getItem("nohelp") !== "true") {
            if(callback) {
                callback(helpel);
                helpel.appendChild(el("p", function (p) {
                    p.appendChild(el("button", function (button) {
                        button.textContent = "ヘルプを消す";
                        button.title = "ヘルプを消します。再びヘルプを見たい場合は設定画面から変更して下さい。";
                        button.addEventListener("click", function (e) {
                            empty(helpel);
                            localStorage.setItem("nohelp", "true");
                        }, false);
                    }));
                }));
            }
        }
    }
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
        function washer(option) {
            setDefault(option, {
                color: [
                    "#5e5e5e", 
                    "#777777", 
                    "#999999"
                ]
            });
            return svg("svg", function (r) {
                var result = r;
                result.width.baseVal.valueAsString = option.width;
                result.height.baseVal.valueAsString = option.height;
                result.viewBox.baseVal.x = 0 , result.viewBox.baseVal.y = 0 , result.viewBox.baseVal.width = 256 , result.viewBox.baseVal.height = 256;
                var d;
                d = [
                    "M25,45", 
                    "L127,90", 
                    "L230,45", 
                    "L127,0", 
                    "Z", 
                    "M60,45", 
                    "a65,28 0 1,1 130,0", 
                    "a65,28 0 1,1 -130,0", 
                    "Z", 
                    
                ].join(" ");
                result.appendChild(path(d, {
                    fill: option.color[1]
                }));
                d = [
                    "M25,45", 
                    "L25,205", 
                    "L127,250", 
                    "L127,90", 
                    "Z", 
                    
                ].join(" ");
                result.appendChild(path(d, {
                    fill: option.color[2]
                }));
                d = [
                    "M127,90", 
                    "L127,250", 
                    "L230,205", 
                    "L230,45", 
                    "Z", 
                    
                ].join(" ");
                result.appendChild(path(d, {
                    fill: option.color[0]
                }));
            });
        }
        icons.washer = washer;
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
        function scheduler(doc, option, clickhandler) {
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
                if(option.del) {
                    div.appendChild(el("button", function (b) {
                        var button = b;
                        button.classList.add("deletebutton");
                        button.textContent = "✗";
                    }));
                }
                if(clickhandler) {
                    div.addEventListener("click", function (e) {
                        var t = e.target;
                        if(t.classList.contains("deletebutton")) {
                            clickhandler("delete");
                        } else {
                            clickhandler("normal");
                        }
                    }, false);
                }
            });
        }
        selectbox.scheduler = scheduler;
        function clothgroup(doc, option, clickhandler) {
            if(!option) {
                option = {
                };
            }
            return el("div", function (div) {
                div.classList.add("clothgroupbox");
                div.classList.add("selection");
                div.appendChild(icons.clothgroup({
                    width: "32px",
                    height: "32px"
                }));
                div.appendChild(document.createTextNode(doc.name));
                if(option.del) {
                    div.appendChild(el("button", function (b) {
                        var button = b;
                        button.classList.add("deletebutton");
                        button.textContent = "✗";
                    }));
                }
                if(clickhandler) {
                    div.addEventListener("click", function (e) {
                        var t = e.target;
                        if(t.classList.contains("deletebutton")) {
                            clickhandler("delete");
                        } else {
                            clickhandler("normal");
                        }
                    }, false);
                }
            });
        }
        selectbox.clothgroup = clothgroup;
        function cloth(doc, option, clickhandler) {
            if(!option) {
                option = {
                };
            }
            if(!option.size) {
                option.size = "64px";
            }
            return el("div", function (div) {
                div.classList.add("clothbox");
                div.classList.add("selection");
                var cloth = Cloth.importCloth({
                    type: doc.type,
                    patterns: doc.patterns
                });
                div.appendChild(cloth.getSVG(option.size, option.size));
                if(clickhandler) {
                    div.addEventListener("click", function (e) {
                        clickhandler("normal");
                    }, false);
                }
                if(doc.name) {
                    div.title = doc.name;
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
    function zeroDate(d) {
        var result = new Date(d.getTime());
        result.setHours(0);
        result.setMinutes(0);
        result.setSeconds(0);
        result.setMilliseconds(0);
        return result;
    }
})(UI || (UI = {}));
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

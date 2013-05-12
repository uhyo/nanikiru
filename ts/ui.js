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
                    return;
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
                    button.classList.add("iconbutton");
                    button.appendChild(Cloth.importCloth({
                        clothType: "T-shirt",
                        colors: [
                            "#999999", 
                            "#999999"
                        ]
                    }).getSVG("24px", "24px"));
                    button.addEventListener("click", function (e) {
                        _this.close("clothgroup::scheduler:" + _this.doc.id);
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
                    console.log(_this.id);
                    localStorage.setItem("lastScheduler", String(_this.id));
                    result.setDate(new Date());
                    c.appendChild(result.getContent());
                    result.onclose(function (returnValue) {
                        if(returnValue === "reload") {
                            _this.open(false);
                        } else {
                            _this.close(returnValue);
                        }
                    });
                    if(conf) {
                        var setting = new SchedulerConfig(_this.db, result);
                        var modal = new ModalUI(result);
                        modal.slide("simple", setting);
                        setting.onclose(function (returnValue) {
                            if(returnValue) {
                                result.close("reload");
                            }
                        });
                    }
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
        };
        return SchedulerList;
    })(UISection);
    UI.SchedulerList = SchedulerList;    
    var ClothGroupListContainer = (function (_super) {
        __extends(ClothGroupListContainer, _super);
        function ClothGroupListContainer(db, schedulerid) {
            var _this = this;
                _super.call(this);
            this.db = db;
            var c = this.getContent();
            var optobj = {
                schedulerid: schedulerid,
                add: true,
                selectadd: schedulerid != null ? true : false,
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
                                if(schedulerid) {
                                    db.getScheduler(schedulerid, function (sdoc) {
                                        if(!sdoc) {
                                            return;
                                        }
                                        sdoc.groups = sdoc.groups.filter(function (x) {
                                            return x !== Number(result[2]);
                                        });
                                        db.setScheduler(sdoc, function (result) {
                                            list.open(db, optobj);
                                        });
                                    });
                                } else {
                                    var res = window.confirm("服グループを削除しますか?\nこの動作は取り消せません。\n\n服グループを削除しても、所属する服は削除されません。");
                                    if(res) {
                                        db.cleanupClothGroup(Number(result[2]), function (result) {
                                            list.open(db, optobj);
                                        });
                                    }
                                }
                                break;
                            case "add":
                                if(schedulerid) {
                                    db.getScheduler(schedulerid, function (sdoc) {
                                        if(!sdoc) {
                                            return;
                                        }
                                        var newcgl = Number(result[2]);
                                        if(sdoc.groups.indexOf(newcgl) < 0) {
                                            sdoc.groups.push(newcgl);
                                        }
                                        db.setScheduler(sdoc, function (result) {
                                            list.open(db, optobj);
                                        });
                                    });
                                }
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
                                var list2 = new ClothGroupList(db, {
                                    add: false,
                                    del: false
                                });
                                var modal = new ModalUI(_self);
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
                                var info = new ClothGroupInfo(db, null, option.schedulerid);
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
                                        var sel = new ClothSelect(null);
                                        var modal = new ModalUI(_self);
                                        modal.slide("simple", sel, function (returnValue) {
                                            if(returnValue != null) {
                                                if(returnValue.mode === "save") {
                                                    var clothd = {
                                                        id: null,
                                                        name: "",
                                                        type: returnValue.doc.clothType,
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
                        section.appendChild(selectbox.cloth(cdoc, function (mode) {
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
                            clothType: obj.type,
                            patterns: []
                        });
                        div.appendChild(el("div", function (div) {
                            div.classList.add("clothselect-typebox");
                            div.dataset.type = obj.type;
                            div.appendChild(sample.getSVG("32px", "32px"));
                        }));
                    });
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
                    clothType: "T-shirt",
                    patterns: []
                };
            }
            this.setType();
        }
        ClothSelect.prototype.setType = function () {
            var _this = this;
            empty(this.previewArea);
            this.cloth = Cloth.importCloth(this.doc);
            var pats = this.doc.patterns;
            var tytyty = Cloth.clothTypes.filter(function (x) {
                return x.type === _this.doc.clothType;
            })[0];
            while(pats.length < tytyty.patternNumber) {
                pats[pats.length] = {
                    type: "simple",
                    size: 0,
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
                        clothType: doc.type,
                        patterns: doc.patterns
                    }).getSVG("128px", "128px"));
                    h1.appendChild(document.createTextNode(doc.name ? doc.name + "の設定" : "設定"));
                }));
                c.appendChild(el("p", function (p) {
                    p.appendChild(el("button", function (b) {
                        b.textContent = "デザインを変更する";
                        b.addEventListener("click", function (e) {
                            var sel = new ClothSelect({
                                clothType: doc.type,
                                patterns: doc.patterns
                            });
                            var modal = new ModalUI(_this);
                            modal.slide("simple", sel, function (returnValue) {
                                if(returnValue != null) {
                                    if(returnValue.mode === "save") {
                                        doc.type = returnValue.doc.clothType;
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
                    section.appendChild(el("p", function (p) {
                        if(doc.used > 0) {
                            p.textContent = "洗濯後" + doc.used + "回使用";
                        } else {
                            p.textContent = "洗濯後未使用";
                        }
                    }));
                    if(doc.status === "washer") {
                        section.appendChild(el("p", function (p) {
                            p.textContent = "洗濯中";
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
                                            var info = new ClothGroupInfo(db, cgdoc.id);
                                            var modal = new ModalUI(_self);
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
                                var list = new ClothGroupList(db, {
                                    del: false
                                });
                                var modal = new ModalUI(_this);
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
        }
        return Menu;
    })(UIObject);
    UI.Menu = Menu;    
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
                    if(callback) {
                        callback(returnValue);
                    }
                });
            }
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
        function cloth(doc, clickhandler) {
            return el("div", function (div) {
                div.classList.add("clothbox");
                div.classList.add("selection");
                var cloth = Cloth.importCloth({
                    clothType: doc.type,
                    patterns: doc.patterns
                });
                div.appendChild(cloth.getSVG("32px", "32px"));
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
})(UI || (UI = {}));
var Cloth = (function () {
    function Cloth() {
        this.clothType = null;
        this.patterns = [];
    }
    Cloth.svgNS = "http://www.w3.org/2000/svg";
    Cloth.clothId = 0;
    Cloth.clothTypes = [
        {
            type: "T-shirt",
            patternNumber: 2
        }
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
        this.clothType = obj.clothType || null;
        this.patterns = Array.isArray(obj.patterns) ? obj.patterns : [];
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
function svg(name, callback) {
    var result = document.createElementNS(Cloth.svgNS, name);
    if(callback) {
        callback(result);
    }
    return result;
}

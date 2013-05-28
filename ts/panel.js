var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Panels;
(function (Panels) {
    var Panel = (function () {
        function Panel(host, db) {
            this.host = host;
            this.db = db;
        }
        Panel.prototype.initContainer = function () {
            var _this = this;
            this.container = el("article", function (article) {
                article.classList.add("panel");
                var title = _this.getTitle();
                if(title) {
                    article.appendChild(el("h1", function (h1) {
                        h1.textContent = _this.getTitle();
                    }));
                }
            });
            return this.container;
        };
        Panel.prototype.getContent = function () {
            return this.container;
        };
        Panel.prototype.setTitle = function (t) {
            this.title = t;
        };
        Panel.prototype.getTitle = function () {
            return this.title;
        };
        Panel.prototype.closeManage = function (ui) {
            var _this = this;
            ui.onclose(function (returnValue) {
                var result;
                if("string" === typeof returnValue) {
                    result = returnValue.match(/^scheduler::(\w+):(\d*)$/);
                    if(result) {
                        var sc;
                        switch(result[1]) {
                            case "open":
                                sc = new SchedulerPanel(_this.host, _this.db, {
                                    schedulerid: result[2] ? Number(result[2]) : null
                                });
                                break;
                            case "conf":
                                sc = new SchedulerPanel(_this.host, _this.db, {
                                    schedulerid: result[2] ? Number(result[2]) : null,
                                    conf: true
                                });
                                break;
                        }
                        _this.host.setPanel(sc);
                        return;
                    }
                    result = returnValue.match(/^clothgroup::(\w+):(\d*)$/);
                    if(result) {
                        var cgl;
                        switch(result[1]) {
                            case "list":
                                cgl = new ClothGroupListPanel(_this.host, _this.db);
                                break;
                            case "id":
                                cgl = new ClothGroupPanel(_this.host, _this.db, Number(result[2]));
                                break;
                        }
                        if(cgl) {
                            _this.host.setPanel(cgl);
                        }
                        return;
                    }
                    result = returnValue.match(/^schedulerlist::$/);
                    if(result) {
                        var sl = new SchedulerListPanel(_this.host, _this.db);
                        _this.host.setPanel(sl);
                        return;
                    }
                    result = returnValue.match(/^cloth::(\d+)$/);
                    if(result) {
                        var cl = new ClothPanel(_this.host, _this.db, Number(result[1]));
                        _this.host.setPanel(cl);
                        return;
                    }
                    if(returnValue === "washer::") {
                        var wa = new WasherPanel(_this.host, _this.db);
                        _this.host.setPanel(wa);
                        return;
                    }
                    if(returnValue === "config::") {
                        var co = new ConfigPanel(_this.host, _this.db);
                        _this.host.setPanel(co);
                    }
                }
            });
        };
        return Panel;
    })();
    Panels.Panel = Panel;    
    var MenuPanel = (function (_super) {
        __extends(MenuPanel, _super);
        function MenuPanel(host, db) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var menu = new UI.Menu();
            c.appendChild(menu.getContent());
            this.closeManage(menu);
        }
        return MenuPanel;
    })(Panel);
    Panels.MenuPanel = MenuPanel;    
    var SchedulerPanel = (function (_super) {
        __extends(SchedulerPanel, _super);
        function SchedulerPanel(host, db, option) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            if(!option) {
                option = {
                };
            }
            var c = this.initContainer();
            var schid = option.schedulerid;
            if(schid == null) {
                var sch = localStorage.getItem("lastScheduler");
                schid = Number(localStorage.getItem("lastScheduler"));
                if(sch == null || isNaN(schid)) {
                    schid = (IDBKeyRange).lowerBound(-Infinity, false);
                }
            }
            var container = new UI.SchedulerContainer(schid, db);
            container.open(!!option.conf);
            c.appendChild(container.getContent());
            this.closeManage(container);
        }
        return SchedulerPanel;
    })(Panel);
    Panels.SchedulerPanel = SchedulerPanel;    
    var SchedulerListPanel = (function (_super) {
        __extends(SchedulerListPanel, _super);
        function SchedulerListPanel(host, db, option) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var list = new UI.SchedulerList(db, {
            });
            c.appendChild(list.getContent());
            this.closeManage(list);
        }
        return SchedulerListPanel;
    })(Panel);
    Panels.SchedulerListPanel = SchedulerListPanel;    
    var ClothGroupListPanel = (function (_super) {
        __extends(ClothGroupListPanel, _super);
        function ClothGroupListPanel(host, db) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var list = new UI.ClothGroupListContainer(db);
            c.appendChild(list.getContent());
            this.closeManage(list);
        }
        return ClothGroupListPanel;
    })(Panel);
    Panels.ClothGroupListPanel = ClothGroupListPanel;    
    var ClothGroupPanel = (function (_super) {
        __extends(ClothGroupPanel, _super);
        function ClothGroupPanel(host, db, clothgroupid) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var info = new UI.ClothGroupInfo(db, clothgroupid);
            c.appendChild(info.getContent());
            this.closeManage(info);
        }
        return ClothGroupPanel;
    })(Panel);
    Panels.ClothGroupPanel = ClothGroupPanel;    
    var ClothPanel = (function (_super) {
        __extends(ClothPanel, _super);
        function ClothPanel(host, db, clothid) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var info = new UI.ClothInfo(db, clothid);
            c.appendChild(info.getContent());
            this.closeManage(info);
        }
        return ClothPanel;
    })(Panel);
    Panels.ClothPanel = ClothPanel;    
    var WasherPanel = (function (_super) {
        __extends(WasherPanel, _super);
        function WasherPanel(host, db) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var washer = new UI.Washer(db);
            washer.open();
            c.appendChild(washer.getContent());
            this.closeManage(washer);
        }
        return WasherPanel;
    })(Panel);
    Panels.WasherPanel = WasherPanel;    
    var StartupPanel = (function (_super) {
        __extends(StartupPanel, _super);
        function StartupPanel(host, db) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var str = new UI.Startup();
            c.appendChild(str.getContent());
            this.closeManage(str);
        }
        return StartupPanel;
    })(Panel);
    Panels.StartupPanel = StartupPanel;    
    var ConfigPanel = (function (_super) {
        __extends(ConfigPanel, _super);
        function ConfigPanel(host, db) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var co = new UI.Config(db);
            co.open();
            c.appendChild(co.getContent());
            this.closeManage(co);
        }
        return ConfigPanel;
    })(Panel);
    Panels.ConfigPanel = ConfigPanel;    
    function el(name, callback) {
        var result = document.createElement(name);
        if(callback) {
            callback(result);
        }
        return result;
    }
})(Panels || (Panels = {}));

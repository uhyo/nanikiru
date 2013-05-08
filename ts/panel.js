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
                    result = returnValue.match(/^scheduler::(\d+)$/);
                    if(result) {
                        var sc = new SchedulerPanel(_this.host, _this.db, Number(result[1]));
                        _this.host.setPanel(sc);
                        return;
                    }
                    result = returnValue.match(/^clothgroup::(\w+):(\d+)$/);
                    if(result) {
                        var cgl;
                        switch(result[1]) {
                            case "scheduler":
                                cgl = new ClothGroupListPanel(_this.host, _this.db, {
                                    scheduler: Number(result[2])
                                });
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
                    result = returnValue.match(/^cloth::(\d+)$/);
                    if(result) {
                        var cl = new ClothPanel(_this.host, _this.db, Number(result[1]));
                        _this.host.setPanel(cl);
                    }
                }
            });
        };
        return Panel;
    })();
    Panels.Panel = Panel;    
    var SchedulerPanel = (function (_super) {
        __extends(SchedulerPanel, _super);
        function SchedulerPanel(host, db, schedulerid) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var schid = schedulerid;
            if(schid == null) {
                schid = Number(localStorage.getItem("lastScheduler"));
                if(!isNaN(schid)) {
                    schid = (IDBKeyRange).lowerBound(-Infinity, false);
                }
            }
            var container = new UI.SchedulerContainer(schid, db);
            container.open();
            c.appendChild(container.getContent());
            this.closeManage(container);
        }
        return SchedulerPanel;
    })(Panel);
    Panels.SchedulerPanel = SchedulerPanel;    
    var ClothGroupListPanel = (function (_super) {
        __extends(ClothGroupListPanel, _super);
        function ClothGroupListPanel(host, db, option) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var list = new UI.ClothGroupList(db, {
                schedulerid: option && option.scheduler,
                add: true,
                del: true
            });
            c.appendChild(list.getContent());
            list.onclose(function (returnValue) {
                if("string" === typeof returnValue) {
                    var result = returnValue.match(/^select;(\d+)$/);
                    if(result) {
                        list.close("clothgroup::id:" + result[1]);
                    }
                }
            });
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
    function el(name, callback) {
        var result = document.createElement(name);
        if(callback) {
            callback(result);
        }
        return result;
    }
})(Panels || (Panels = {}));

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
            if(ui instanceof UI.Scheduler || ui instanceof UI.SchedulerContainer) {
                var id = ui instanceof UI.Scheduler ? (ui).doc.id : (ui).id;
                ui.onclose(function (returnValue) {
                    if(returnValue === "clothGroupEdit") {
                        var clothgroup = new ClothGroupPanel(_this.host, _this.db, {
                            scheduler: id
                        });
                        _this.host.setPanel(clothgroup);
                    }
                });
            }
        };
        return Panel;
    })();
    Panels.Panel = Panel;    
    var TopPanel = (function (_super) {
        __extends(TopPanel, _super);
        function TopPanel(host, db) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var schid = Number(localStorage.getItem("lastScheduler"));
            if(!isNaN(schid)) {
                schid = (IDBKeyRange).lowerBound(-Infinity, false);
            }
            var container = new UI.SchedulerContainer(schid, db);
            container.open();
            c.appendChild(container.getContent());
            this.closeManage(container);
        }
        return TopPanel;
    })(Panel);
    Panels.TopPanel = TopPanel;    
    var ClothGroupPanel = (function (_super) {
        __extends(ClothGroupPanel, _super);
        function ClothGroupPanel(host, db, option) {
                _super.call(this, host, db);
            this.host = host;
            this.db = db;
            var c = this.initContainer();
            var list = new UI.ClothGroupList(db, option && option.scheduler);
            c.appendChild(list.getContent());
            this.closeManage(list);
        }
        return ClothGroupPanel;
    })(Panel);
    Panels.ClothGroupPanel = ClothGroupPanel;    
    function el(name, callback) {
        var result = document.createElement(name);
        if(callback) {
            callback(result);
        }
        return result;
    }
})(Panels || (Panels = {}));

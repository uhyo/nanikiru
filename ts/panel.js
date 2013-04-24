var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Panels;
(function (Panels) {
    var Panel = (function () {
        function Panel() {
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
        return Panel;
    })();
    Panels.Panel = Panel;    
    var TopPanel = (function (_super) {
        __extends(TopPanel, _super);
        function TopPanel(db) {
                _super.call(this);
            this.db = db;
            var c = this.initContainer();
            var schid = Number(localStorage.getItem("lastScheduler"));
            if(!isNaN(schid)) {
                schid = (IDBKeyRange).lowerBound(-Infinity, false);
            }
            UI.Scheduler.getScheduler(db, schid, function (result) {
                if(result) {
                    result.render(new Date());
                    c.appendChild(result.getContent());
                } else {
                    c.appendChild(el("p", function (p) {
                        p.textContent = "カレンダーがありません。";
                    }));
                }
            });
        }
        return TopPanel;
    })(Panel);
    Panels.TopPanel = TopPanel;    
    function el(name, callback) {
        var result = document.createElement(name);
        if(callback) {
            callback(result);
        }
        return result;
    }
})(Panels || (Panels = {}));

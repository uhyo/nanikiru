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
                article.appendChild(el("h1", function (h1) {
                    h1.textContent = _this.getTitle();
                }));
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
        function TopPanel() {
                _super.call(this);
            this.setTitle("何着る? トップ");
            this.initContainer();
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

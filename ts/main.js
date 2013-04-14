var AppHost = (function () {
    function AppHost() {
        this.panels = [];
        this.now = null;
        this.container = document.getElementById('main');
    }
    AppHost.prototype.setPanel = function (p) {
        this.panels.push(p);
        this.now = p;
        this.setContent(p.getContent());
    };
    AppHost.prototype.setContent = function (n) {
        var c = this.container;
        if(c.firstChild) {
            c.removeChild(c.firstChild);
        }
        c.appendChild(n);
    };
    return AppHost;
})();
document.addEventListener("DOMContentLoaded", function () {
    var host = new AppHost();
    var tp = new Panels.TopPanel();
    host.setPanel(tp);
}, false);

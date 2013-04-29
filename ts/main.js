var AppHost = (function () {
    function AppHost() {
        this.now = null;
        this.container = document.getElementById('main');
    }
    AppHost.prototype.setPanel = function (p) {
        this.now = p;
        this.setContent(p.getContent());
    };
    AppHost.prototype.setContent = function (n) {
        var c = this.container;
        while(c.firstChild) {
            c.removeChild(c.firstChild);
        }
        c.appendChild(n);
    };
    return AppHost;
})();
document.addEventListener("DOMContentLoaded", function () {
    var host = new AppHost();
    var db = new DB();
    db.open(function (result) {
        if(result) {
            var tp = new Panels.SchedulerPanel(host, db);
            host.setPanel(tp);
        }
    });
}, false);

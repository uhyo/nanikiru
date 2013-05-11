var AppHost = (function () {
    function AppHost(db) {
        this.db = db;
        this.now = null;
        this.container = document.getElementById('main');
        this.menuContent = document.createElement("div");
        this.mainContent = document.createElement("div");
        this.container.appendChild(this.menuContent);
        this.container.appendChild(this.mainContent);
        var me = new Panels.MenuPanel(this, db);
        this.menuContent.appendChild(me.getContent());
        var tp = new Panels.SchedulerPanel(this, db);
        this.setPanel(tp);
    }
    AppHost.prototype.setPanel = function (p) {
        this.now = p;
        this.setContent(p.getContent());
    };
    AppHost.prototype.setContent = function (n) {
        var c = this.mainContent;
        while(c.firstChild) {
            c.removeChild(c.firstChild);
        }
        c.appendChild(n);
    };
    return AppHost;
})();
document.addEventListener("DOMContentLoaded", function () {
    var db = new DB();
    db.open(function (result) {
        if(result) {
            var host = new AppHost(db);
        }
    });
}, false);

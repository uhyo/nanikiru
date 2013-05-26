var AppHost = (function () {
    function AppHost(db) {
        this.db = db;
        this.now = null;
        this.container = document.getElementById('main');
        this.menuContent = document.createElement("div");
        this.concon = document.createElement("div");
        this.concon.classList.add("concon");
        this.mainContent = document.createElement("div");
        this.mainContent.classList.add("mainco");
        this.helpContent = document.createElement("div");
        this.helpContent.classList.add("helpco");
        this.container.appendChild(this.menuContent);
        this.container.appendChild(this.concon);
        this.concon.appendChild(this.mainContent);
        this.concon.appendChild(this.helpContent);
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

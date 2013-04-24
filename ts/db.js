var DB = (function () {
    function DB() {
        this.name = "nanikiru";
    }
    DB.prototype.open = function (callback) {
        var _this = this;
        var request = indexedDB.open(this.name, 1);
        request.addEventListener("upgradeneeded", function (e) {
            var db = request.result;
            var old = e.oldVersion;
            if(old < 1) {
                var cloth = db.createObjectStore("cloth", {
                    keyPath: "id",
                    autoIncrement: true
                });
                cloth.createIndex("type", "type", {
                    unique: false,
                    multiEntry: false
                });
                cloth.createIndex("group", "group", {
                    unique: false,
                    multiEntry: true
                });
                cloth.createIndex("status", "status", {
                    unique: false,
                    multiEntry: true
                });
                var clothgroup = db.createObjectStore("clothgroup", {
                    keyPath: "id",
                    autoIncrement: true
                });
                var scheduler = db.createObjectStore("scheduler", {
                    keyPath: "id",
                    autoIncrement: true
                });
                scheduler.createIndex("type", "type", {
                    unique: false,
                    multiEntry: false
                });
                var log = db.createObjectStore("log", {
                    keyPath: "id",
                    autoIncrement: true
                });
                log.createIndex("scheduler", "scheduler", {
                    unique: false,
                    multiEntry: true
                });
                log.createIndex("cloth_complex", "cloth", {
                    unique: false,
                    multiEntry: false
                });
                log.createIndex("cloth_multi", "cloth", {
                    unique: false,
                    multiEntry: true
                });
                var req = scheduler.add({
                    "type": "calender",
                    "name": "カレンダー",
                    "made": new Date()
                });
                req.addEventListener("success", function (e) {
                    console.log("新しいカレンダーが作成されました。");
                });
                req.addEventListener("error", function (e) {
                    console.error("カレンダーの作成に失敗しました。");
                });
                delete req;
            }
        });
        request.addEventListener("success", function (e) {
            _this.db = request.result;
            if(callback) {
                callback(true);
            }
        });
        request.addEventListener("error", function (e) {
            console.error("DB open error:", request.error);
            if(callback) {
                callback(false);
            }
        });
    };
    DB.prototype.getScheduler = function (id, callback) {
        var tr = this.db.transaction("scheduler", "readonly");
        var scheduler = tr.objectStore("scheduler");
        var req = scheduler.get(id);
        req.addEventListener("success", function (e) {
            callback(req.result);
        });
        req.addEventListener("error", function (e) {
            console.error("getScheduler error:", req.error);
            callback(null);
        });
        delete req;
    };
    return DB;
})();

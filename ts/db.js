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
                scheduler.createIndex("groups", "groups", {
                    unique: false,
                    multiEntry: true
                });
                var log = db.createObjectStore("log", {
                    keyPath: "id",
                    autoIncrement: true
                });
                log.createIndex("scheduler", "scheduler", {
                    unique: false,
                    multiEntry: false
                });
                log.createIndex("cloth_complex", "cloth", {
                    unique: false,
                    multiEntry: false
                });
                log.createIndex("cloth_multi", "cloth", {
                    unique: false,
                    multiEntry: true
                });
                log.createIndex("date", "date", {
                    unique: false,
                    multiEntry: false
                });
                log.createIndex("scheduler-date", [
                    "scheduler", 
                    "date"
                ], {
                    unique: false,
                    multiEntry: false
                });
                var req = scheduler.add({
                    "type": "calender",
                    "name": "カレンダー",
                    "made": new Date(),
                    "groups": []
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
    DB.prototype.setScheduler = function (doc, callback) {
        var tr = this.db.transaction("scheduler", "readwrite");
        var scheduler = tr.objectStore("scheduler");
        var req = scheduler.put(doc);
        req.addEventListener("success", function (e) {
            setTimeout(function () {
                callback(req.result);
            }, 0);
        });
        req.addEventListener("error", function (e) {
            console.error("getScheduler error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.eachScheduler = function (cond, callback) {
        var tr = this.db.transaction("scheduler", "readonly");
        var scheduler = tr.objectStore("scheduler");
        var req;
        if(cond.type != null) {
            req = scheduler.index("type").openCursor(cond.type, "next");
        } else if(cond.group != null) {
            req = scheduler.index("groups").openCursor(cond.group, "next");
        } else {
            req = scheduler.openCursor(cond.keyrange || null, "next");
        }
        if(req == null) {
            callback(null);
            return;
        }
        req.addEventListener("success", function (e) {
            var cursor = req.result;
            if(!cursor) {
                callback(null);
                return;
            } else {
                callback(cursor.value);
                cursor.advance(1);
            }
        });
        req.addEventListener("error", function (e) {
            console.error("eachClothGroup error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.removeScheduler = function (id, callback) {
        var tr = this.db.transaction("scheduler", "readwrite");
        var scheduler = tr.objectStore("scheduler");
        var req = scheduler.delete(id);
        req.addEventListener("success", function (e) {
            setTimeout(function () {
                callback(true);
            }, 0);
        });
        req.addEventListener("error", function (e) {
            console.error("removeScheduler error:", req.error);
            callback(false);
        });
        delete req;
    };
    DB.prototype.cleanupScheduler = function (id, callback) {
        this.removeScheduler(id, function (result) {
            if(result && localStorage.getItem("lastScheduler") === String(id)) {
                localStorage.removeItem("lastScheduler");
            }
            callback(result);
        });
    };
    DB.prototype.getClothGroup = function (id, callback) {
        var tr = this.db.transaction("clothgroup", "readonly");
        var clothgroup = tr.objectStore("clothgroup");
        var req = clothgroup.get(id);
        req.addEventListener("success", function (e) {
            callback(req.result);
        });
        req.addEventListener("error", function (e) {
            console.error("getClothGroup error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.getClothGroups = function (ids, callback) {
        var tr = this.db.transaction("clothgroup", "readonly");
        var clothgroup = tr.objectStore("clothgroup");
        var result = [];
        getone(0);
        function getone(index) {
            if(ids[index] == null) {
                callback(result);
                return;
            }
            var req = clothgroup.get(ids[index]);
            req.addEventListener("success", function (e) {
                var cgdoc = req.result;
                if(cgdoc == null) {
                    console.warn("no cgdoc!", ids, index);
                }
                result.push(cgdoc);
                getone(index + 1);
            });
            req.addEventListener("error", function (e) {
                console.error("getClothGroups error:", req.error);
                callback(null);
            });
        }
    };
    DB.prototype.setClothGroup = function (doc, callback) {
        var tr = this.db.transaction("clothgroup", "readwrite");
        var clothgroup = tr.objectStore("clothgroup");
        var req = clothgroup.put(doc);
        req.addEventListener("success", function (e) {
            setTimeout(function () {
                callback(req.result);
            }, 0);
        });
        req.addEventListener("error", function (e) {
            console.error("getClothGroup error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.eachClothGroup = function (keyrange, callback) {
        var tr = this.db.transaction("clothgroup", "readonly");
        var clothgroup = tr.objectStore("clothgroup");
        var req = clothgroup.openCursor(keyrange, "next");
        if(req == null) {
            callback(null);
            return;
        }
        req.addEventListener("success", function (e) {
            var cursor = req.result;
            if(!cursor) {
                callback(null);
                return;
            } else {
                callback(cursor.value);
                cursor.advance(1);
            }
        });
        req.addEventListener("error", function (e) {
            console.error("eachClothGroup error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.removeClothGroup = function (id, callback) {
        var tr = this.db.transaction("clothgroup", "readwrite");
        var clothgroup = tr.objectStore("clothgroup");
        var req = clothgroup.delete(id);
        req.addEventListener("success", function (e) {
            setTimeout(function () {
                callback(true);
            }, 0);
        });
        req.addEventListener("error", function (e) {
            console.error("getScheduler error:", req.error);
            callback(false);
        });
        delete req;
    };
    DB.prototype.cleanupClothGroup = function (id, callback) {
        var tr = this.db.transaction([
            "clothgroup", 
            "cloth", 
            "scheduler"
        ], "readwrite");
        var clothgroup = tr.objectStore("clothgroup"), cloth = tr.objectStore("cloth"), scheduler = tr.objectStore("scheduler");
        var req = clothgroup.delete(id);
        req.addEventListener("success", function (e) {
            var req2 = cloth.index("group").openCursor(id, "next");
            if(!req2) {
                nx();
                return;
            }
            req2.addEventListener("success", function (e) {
                var cursor = req2.result;
                if(!cursor) {
                    nx();
                    return;
                } else {
                    var cl = cursor.value;
                    cl.group = cl.group.filter(function (x) {
                        return x !== id;
                    });
                    var req2_1 = cloth.put(cl);
                    req2_1.addEventListener("success", function (e) {
                        cursor.advance(1);
                    });
                    req2_1.addEventListener("error", function (e) {
                        console.error("cleanupClothgroup error:", req.error);
                        tr.abort();
                        callback(false);
                    });
                }
            });
            req2.addEventListener("error", function (e) {
                console.error("cleanupClothGroup error:", req.error);
                tr.abort();
                callback(false);
            });
            function nx() {
                var req3 = scheduler.index("groups").openCursor(id, "next");
                if(!req3) {
                    setTimeout(function () {
                        callback(true);
                    }, 0);
                    return;
                }
                req3.addEventListener("success", function (e) {
                    var cursor = req3.result;
                    if(!cursor) {
                        setTimeout(function () {
                            callback(true);
                        }, 0);
                        return;
                    } else {
                        var sc = cursor.value;
                        sc.groups = sc.groups.filter(function (x) {
                            return x !== id;
                        });
                        var req3_1 = scheduler.put(sc);
                        req3_1.addEventListener("success", function (e) {
                            cursor.advance(1);
                        });
                        req3_1.addEventListener("error", function (e) {
                            console.error("cleanupClothgroup error:", req.error);
                            tr.abort();
                            callback(false);
                        });
                    }
                });
                req2.addEventListener("error", function (e) {
                    console.error("cleanupClothGroup error:", req.error);
                    tr.abort();
                    callback(false);
                });
            }
        });
        req.addEventListener("error", function (e) {
            console.error("cleanupClothGroup error:", req.error);
            tr.abort();
            callback(false);
        });
    };
    DB.prototype.getCloth = function (id, callback) {
        var tr = this.db.transaction("cloth", "readonly");
        var cloth = tr.objectStore("cloth");
        var req = cloth.get(id);
        req.addEventListener("success", function (e) {
            callback(req.result);
        });
        req.addEventListener("error", function (e) {
            console.error("getCloth error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.getClothes = function (ids, callback) {
        var tr = this.db.transaction("cloth", "readonly");
        var cloth = tr.objectStore("cloth");
        var result = [];
        getone(0);
        function getone(index) {
            if(ids[index] == null) {
                callback(result);
                return;
            }
            var req = cloth.get(ids[index]);
            req.addEventListener("success", function (e) {
                var doc = req.result;
                if(!doc) {
                    console.warn("getClothes nocloth", ids, index);
                }
                result.push(doc);
                getone(index + 1);
            });
            req.addEventListener("error", function (e) {
                console.error("getClothes error:", req.error);
                callback(null);
            });
        }
    };
    DB.prototype.setCloth = function (doc, callback) {
        var tr = this.db.transaction("cloth", "readwrite");
        var cloth = tr.objectStore("cloth");
        var req = cloth.put(doc);
        req.addEventListener("success", function (e) {
            setTimeout(function () {
                callback(req.result);
            }, 0);
        });
        req.addEventListener("error", function (e) {
            console.error("setCloth error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.eachCloth = function (cond, callback) {
        var tr = this.db.transaction("cloth", "readonly");
        var cloth = tr.objectStore("cloth");
        var req;
        if(cond.type != null) {
            req = cloth.index("type").openCursor(cond.type, "next");
        } else if(cond.group != null) {
            req = cloth.index("group").openCursor(cond.group, "next");
        } else if(cond.status != null) {
            req = cloth.index("status").openCursor(cond.status, "next");
        } else {
            req = cloth.openCursor(cond.keyrange || null, "next");
        }
        if(req == null) {
            callback(null);
            return;
        }
        req.addEventListener("success", function (e) {
            var cursor = req.result;
            if(!cursor) {
                callback(null);
                return;
            } else {
                callback(cursor.value);
                cursor.advance(1);
            }
        });
        req.addEventListener("error", function (e) {
            console.error("eachCloth error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.setLog = function (doc, callback) {
        var tr = this.db.transaction("log", "readwrite");
        var log = tr.objectStore("log");
        var req = log.put(doc);
        req.addEventListener("success", function (e) {
            setTimeout(function () {
                callback(req.result);
            }, 0);
        });
        req.addEventListener("error", function (e) {
            console.error("setLog error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.eachLog = function (cond, callback) {
        var tr = this.db.transaction("log", "readonly");
        var log = tr.objectStore("log");
        var req;
        if(cond.cloth != null) {
            if(Array.isArray(cond.cloth)) {
                req = log.index("cloth_complex").openCursor(cond.cloth, "next");
            } else {
                req = log.index("cloth_multi").openCursor(cond.cloth, "next");
            }
        } else if(cond.scheduler != null && cond.date != null) {
            req = log.index("scheduler-date").openCursor((IDBKeyRange).bound([
                cond.scheduler, 
                cond.date.start
            ], [
                cond.scheduler, 
                cond.date.end
            ], false, false), "next");
        } else if(cond.scheduler != null) {
            req = log.index("scheduler").openCursor(cond.scheduler, "next");
        } else if(cond.date != null) {
            req = log.index("date").openCursor((IDBKeyRange).bound(cond.date.start, cond.date.end, false, false), "next");
        } else {
            req = log.openCursor(cond.keyrange || null, "next");
        }
        if(req == null) {
            callback(null);
            return;
        }
        req.addEventListener("success", function (e) {
            var cursor = req.result;
            if(!cursor) {
                callback(null);
                return;
            } else {
                callback(cursor.value);
                cursor.advance(1);
            }
        });
        req.addEventListener("error", function (e) {
            console.error("eachLog error:", req.error);
            callback(null);
        });
        delete req;
    };
    DB.prototype.addupLog = function (doc, callback) {
        var tr = this.db.transaction([
            "cloth", 
            "log"
        ], "readwrite");
        var cloth = tr.objectStore("cloth"), log = tr.objectStore("log");
        var req = log.put(doc);
        req.addEventListener("success", function (e) {
            var count = 0;
            doc.cloth.forEach(function (cid) {
                var req2 = cloth.get(cid);
                req2.addEventListener("success", function (e) {
                    var cdoc = req2.result;
                    cdoc.used++;
                    if(!cdoc.lastuse || cdoc.lastuse.getTime() < doc.date.getTime()) {
                        cdoc.lastuse = doc.date;
                    }
                    var req3 = cloth.put(cdoc);
                    req3.addEventListener("success", function (e) {
                        count++;
                        if(count >= doc.cloth.length) {
                            setTimeout(function () {
                                callback(req.result);
                            }, 0);
                        }
                    });
                    req3.addEventListener("error", function (e) {
                        console.error("addupLog error:", req3.error);
                        tr.abort();
                        callback(null);
                    });
                });
                req2.addEventListener("error", function (e) {
                    console.error("addupLog error:", req2.error);
                    tr.abort();
                    callback(null);
                });
            });
        });
        req.addEventListener("error", function (e) {
            console.error("addupLog error:", req.error);
            tr.abort();
            callback(null);
        });
        delete req;
    };
    DB.prototype.exportData = function (callback) {
        var stores = [
            "cloth", 
            "clothgroup", 
            "scheduler", 
            "log"
        ];
        var tr = this.db.transaction(stores, "readonly");
        var result = {
        };
        var nextStore = function (index) {
            var storeName = stores[index];
            if(storeName == null) {
                callback(result);
                return;
            }
            var arr = result[storeName] = [];
            var store = tr.objectStore(storeName);
            var req = store.openCursor(null, "next");
            if(req == null) {
                nextStore(index + 1);
                return;
            }
            req.addEventListener("success", function (e) {
                var cursor = req.result;
                if(!cursor) {
                    nextStore(index + 1);
                    return;
                }
                arr.push(cursor.value);
                cursor.advance(1);
            });
            req.addEventListener("error", function (e) {
                console.error("exportData error:", req.error);
                callback(null);
            });
        };
        nextStore(0);
    };
    DB.prototype.importData = function (obj, callback) {
        var stores = [
            "cloth", 
            "clothgroup", 
            "scheduler", 
            "log"
        ];
        var tr = this.db.transaction(stores, "readwrite");
        var nextStore = function (index) {
            var storeName = stores[index];
            if(storeName == null) {
                callback(true);
                return;
            }
            var sto = obj[storeName];
            if(sto == null) {
                callback(false);
                return;
            }
            var store = tr.objectStore(storeName);
            var req = store.clear();
            req.addEventListener("success", function (e) {
                var nextRecord = function (index2) {
                    var rec = sto[index2];
                    if(rec == null) {
                        nextStore(index + 1);
                        return;
                    }
                    if(storeName === "cloth") {
                        if(rec.made) {
                            rec.made = new Date(rec.made);
                        }
                        if(rec.lastuse) {
                            rec.lastuse = new Date(rec.lastuse);
                        }
                    }
                    if(storeName === "clothgroup" || storeName === "scheduler") {
                        if(rec.made) {
                            rec.made = new Date(rec.made);
                        }
                    }
                    if(storeName === "log") {
                        if(rec.date) {
                            rec.date = new Date(rec.date);
                        }
                    }
                    var req2 = store.add(rec);
                    req2.addEventListener("success", function (e) {
                        nextRecord(index2 + 1);
                    });
                    req2.addEventListener("error", function (e) {
                        console.error("importData error:", req2.error);
                        tr.abort();
                        callback(false);
                    });
                };
                nextRecord(0);
            });
            req.addEventListener("error", function (e) {
                console.error("importData error:", req.error);
                tr.abort();
                callback(false);
            });
        };
        nextStore(0);
    };
    return DB;
})();

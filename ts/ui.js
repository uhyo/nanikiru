var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var UIObject = (function () {
        function UIObject() {
            this.container = document.createElement("div");
        }
        UIObject.prototype.getContent = function () {
            return this.container;
        };
        return UIObject;
    })();
    UI.UIObject = UIObject;    
    var Scheduler = (function (_super) {
        __extends(Scheduler, _super);
        function Scheduler() {
            _super.apply(this, arguments);

        }
        Scheduler.prototype.setDate = function (d) {
            this.date = d;
            this.render(d);
        };
        Scheduler.prototype.render = function (d) {
        };
        return Scheduler;
    })(UIObject);
    UI.Scheduler = Scheduler;    
    var Calender = (function (_super) {
        __extends(Calender, _super);
        function Calender(db) {
                _super.call(this);
            this.db = db;
        }
        Calender.prototype.render = function (d) {
            var c = this.getContent();
            var currentMonth = d.getMonth(), currentDate = d.getDate();
            var mv = new Date(d.toJSON());
            mv.setDate(1);
            mv.setDate(1 - mv.getDay());
            var t = document.createElement("table");
            t.classList.add("calender");
            while(mv.getMonth() <= currentMonth) {
                var tr = t.insertRow(-1);
                for(var i = 0; i < 7; i++) {
                    var dd = mv.getDate(), mn = mv.getMonth();
                    var td = tr.insertCell(-1);
                    if(i === 0) {
                        td.classList.add("Sunday");
                    } else if(i === 6) {
                        td.classList.add("Saturday");
                    }
                    if(mn < currentMonth || currentMonth === mn && dd < currentDate) {
                        td.classList.add("past");
                    } else if(currentDate === dd && currentMonth === mn) {
                        td.classList.add("today");
                    }
                    td.appendChild(el("div", function (div) {
                        div.classList.add("date");
                        div.appendChild(el("time", function (time) {
                            var t = time;
                            t.dateTime = mv.getFullYear() + "-" + (mn + 1) + "-" + dd;
                            t.textContent = (mn !== currentMonth ? (mn + 1) + "/" : "") + dd;
                        }));
                    }));
                    mv.setDate(dd + 1);
                }
            }
            while(c.firstChild) {
                c.removeChild(c.firstChild);
            }
            c.appendChild(t);
        };
        return Calender;
    })(Scheduler);
    UI.Calender = Calender;    
    function el(name, callback) {
        var result = document.createElement(name);
        if(callback) {
            callback(result);
        }
        return result;
    }
})(UI || (UI = {}));

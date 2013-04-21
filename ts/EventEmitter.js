var EventEmitter = (function () {
    function EventEmitter() {
        this.events = {
        };
        this.maxl = 10;
    }
    EventEmitter.prototype.on = function (name, listener) {
        var c = this.events[name];
        if(!c) {
            c = this.events[name] = [];
        }
        c.push(listener);
        if(this.maxl && c.length > this.maxl) {
            console.warn("possible EventEmitter memory leak detected.");
        }
    };
    EventEmitter.prototype.addListener = function (name, listener) {
        this.on(name, listener);
    };
    EventEmitter.prototype.once = function (name, listener) {
        var _t = this;
        this.on(name, handler);
        function handler() {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            listener.apply(null, args);
            _t.removeListener(name, handler);
        }
    };
    EventEmitter.prototype.removeListener = function (name, listener) {
        var c = this.events[name];
        if(!c) {
            return;
        }
        this.events[name] = c.filter(function (x) {
            return x !== listener;
        });
    };
    EventEmitter.prototype.removeAllListeners = function (name) {
        if(name == null) {
            this.events = {
            };
        } else {
            delete this.events[name];
        }
    };
    EventEmitter.prototype.setMaxListeners = function (num) {
        this.maxl = num;
    };
    EventEmitter.prototype.listeners = function (name) {
        if(!this.events[name]) {
            return [];
        }
        return this.events[name].concat([]);
    };
    EventEmitter.prototype.emit = function (name) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        var c = this.events[name];
        if(!c) {
            return;
        }
        for(var i = 0, l = c.length; i < l; i++) {
            c[i].apply(null, args);
        }
    };
    EventEmitter.listenerCount = function listenerCount(emitter, name) {
        var c = emitter.events[name];
        if(!c) {
            return 0;
        }
        return c.length;
    };
    return EventEmitter;
})();

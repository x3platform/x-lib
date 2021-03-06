///<reference path="../../typings/node.d.ts" />
var util = require("./util");
var _path = require("path"), _fs = require("fs");
function createWatcher(watchPaths, callback) {
    var chokidar = require("chokidar"), watcher, timeoutId, callbacking = false, events = {};
    function start() {
        if (watcher) {
            return;
        }
        watcher = chokidar.watch(watchPaths, { ignoreInitial: true, persistent: true, ignorePermissionErrors: true });
        watcher.on("add", function (path, stats) {
            add(path, "add", stats);
        }).on("change", function (path, stats) {
            add(path, "change", stats);
        }).on("unlink", function (path, stats) {
            add(path, "unlink", stats);
        }).on("error", function (error) {
            util.writeError(error);
        });
    }
    function add(path, eventName, stats) {
        if (_path.extname(path) !== ".ts") {
            return;
        }
        path = util.normalizePath(path);
        if (stats && stats.mtime) {
            events[path] = {
                mtime: stats.mtime.getTime(),
                ev: eventName
            };
        }
        else {
            events[path] = {
                mtime: eventName === "unlink" ? 0 : _fs.statSync(path).mtime.getTime(),
                ev: eventName
            };
        }
        util.write(eventName.cyan + " " + path);
        executeCallback();
    }
    function clone(value) {
        var result = {};
        Object.keys(value).forEach(function (item) {
            result[item] = value[item];
        });
        return result;
    }
    function executeCallback() {
        if (!Object.keys(events).length) {
            return;
        }
        if (callbacking) {
            return;
        }
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(function () {
            callbacking = true;
            var value = clone(events);
            events = {};
            try {
                callback(value, function () {
                    callbacking = false;
                    executeCallback();
                });
            }
            catch (e) {
                callbacking = false;
            }
        }, 1000);
    }
    return {
        start: start
    };
}
exports.createWatcher = createWatcher;

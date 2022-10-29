"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientEngine = exports.OnSafeEngine = exports.Cronjob = exports.Log = exports.Setting = exports.FileManager = exports.Database = exports.event_init = exports.event_error = exports.event_after = exports.event_before = exports.DB_PATH = exports.FILE_PATH = void 0;
var fs_1 = require("fs");
var fs_extra_1 = require("fs-extra");
var path_1 = __importDefault(require("path"));
var node_cron_1 = __importDefault(require("node-cron"));
var remote_1 = require("@electron/remote");
var electron_1 = require("electron");
function log(data) {
    electron_1.ipcRenderer.send('logger', data);
}
var basepath = remote_1.app.getAppPath();
exports.FILE_PATH = path_1.default.join(basepath, 'config.json');
exports.DB_PATH = path_1.default.join(basepath, 'db.json');
exports.event_before = new CustomEvent('before-backup');
exports.event_after = new CustomEvent('after-backup');
exports.event_error = new CustomEvent('error-backup');
exports.event_init = new CustomEvent('init-backup');
var Database = /** @class */ (function () {
    function Database() {
    }
    Database.getLogs = function () {
        if ((0, fs_1.existsSync)(exports.DB_PATH)) {
            var data = JSON.parse((0, fs_1.readFileSync)(exports.DB_PATH, { encoding: 'utf-8' }));
            return Log.listFromJson(data);
        }
        return [];
    };
    Database.saveLog = function (log) {
        var logs = Database.getLogs();
        logs.push(log);
        this.saveLogs(logs);
    };
    Database.saveLogs = function (logs) {
        var json = JSON.stringify(logs);
        (0, fs_1.writeFileSync)(exports.DB_PATH, json);
    };
    return Database;
}());
exports.Database = Database;
var FileManager = /** @class */ (function () {
    function FileManager() {
    }
    FileManager.getContent = function () {
        if ((0, fs_1.existsSync)(exports.FILE_PATH)) {
            return (0, fs_1.readFileSync)(exports.FILE_PATH, { encoding: 'utf-8' });
        }
        return null;
    };
    FileManager.writeContent = function (data) {
        (0, fs_1.writeFileSync)(exports.FILE_PATH, data, { encoding: 'utf-8' });
    };
    return FileManager;
}());
exports.FileManager = FileManager;
var Setting = /** @class */ (function () {
    function Setting(from, to, cron) {
        this.from = from;
        this.to = to;
        this.cron = cron;
    }
    Setting.loadFromFile = function () {
        return new Promise(function (r, e) {
            var data = FileManager.getContent();
            var setting;
            if (data) {
                var obj = JSON.parse(data);
                r(new Setting(obj['from'], obj['to'], obj['cron']));
            }
            else {
                r(null);
            }
        });
    };
    Setting.prototype.toJson = function () {
        return {
            'from': this.from,
            'to': this.to,
            'cron': this.cron
        };
    };
    Setting.prototype.save = function () {
        FileManager.writeContent(JSON.stringify(this.toJson()));
    };
    return Setting;
}());
exports.Setting = Setting;
var Log = /** @class */ (function () {
    function Log(from, to, date, result, description) {
        if (description === void 0) { description = null; }
        this.from = from;
        this.to = to;
        this.date = date;
        this.result = result;
        this.description = description;
    }
    Log.fromJson = function (json) {
        return new Log(json.from, json.to, json.date, json.result, json.description);
    };
    Log.listFromJson = function (json) {
        var lista = [];
        json.forEach(function (element) {
            lista.push(Log.fromJson(element));
        });
        return lista;
    };
    Object.defineProperty(Log.prototype, "mysqlDate", {
        get: function () {
            return "".concat(this.date.getFullYear(), "-").concat(this.date.getMonth() + 1, "-").concat(this.date.getDate());
        },
        enumerable: false,
        configurable: true
    });
    Log.prototype.save = function () {
        Database.saveLog(this);
    };
    return Log;
}());
exports.Log = Log;
var Cronjob = /** @class */ (function () {
    function Cronjob(cronjob, callback) {
        this.cron = cronjob;
        this.callback = callback;
    }
    Object.defineProperty(Cronjob.prototype, "cron", {
        get: function () {
            return this._cron;
        },
        set: function (value) {
            if (node_cron_1.default.validate(value)) {
                this._cron = value;
            }
            else {
                throw new Error('cronjob not correct');
            }
        },
        enumerable: false,
        configurable: true
    });
    Cronjob.prototype.init = function () {
        if (node_cron_1.default.validate(this.cron)) {
            this.task = node_cron_1.default.schedule(this.cron, this.callback);
            this.start();
        }
    };
    Cronjob.prototype.start = function () {
        log('[Cronjob] => Start (' + this.cron + ')');
        this.task.start();
    };
    Cronjob.prototype.stop = function () {
        this.task.stop();
    };
    Cronjob.prototype.destroy = function () {
        this.stop();
        this.task = null;
    };
    return Cronjob;
}());
exports.Cronjob = Cronjob;
var OnSafeEngine = /** @class */ (function () {
    function OnSafeEngine() {
    }
    OnSafeEngine.prototype.init = function (log) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, Setting.loadFromFile()];
                    case 1:
                        _a.setting = _b.sent();
                        this.cronjob = new Cronjob(this.setting.cron, this.backup);
                        this.cronjob.init();
                        this.log = log;
                        document.dispatchEvent(exports.event_init);
                        log(this.setting.toJson());
                        return [2 /*return*/];
                }
            });
        });
    };
    OnSafeEngine.prototype.backup = function (now) {
        document.dispatchEvent(exports.event_before);
        var from = this.setting.from;
        var to = this.setting.to;
        var start = new Date();
        (0, fs_extra_1.ensureDirSync)(from);
        (0, fs_extra_1.ensureDirSync)(to);
        (0, fs_extra_1.copySync)(from, to);
        document.dispatchEvent(exports.event_after);
        // this.copyDir((error: Error, code: number) => {
        //   let err = error ? error.message : 'ok'
        //   if (err)
        //   {
        //     document.dispatchEvent(event_error)
        //   }
        //   document.dispatchEvent(event_after)
        //   let log = new Log(from, to, start, code, err);
        //   log.save()
        // })
    };
    /**
     * copy a folder in to anather with fs-extra
     * @param callback called when copy process finish, error => the error occurred, code => 200:ok, 500:error
     */
    OnSafeEngine.prototype.copyDir = function (callback) {
        try {
            log('near');
            (0, fs_extra_1.ensureDirSync)(this.setting.from);
            (0, fs_extra_1.ensureDirSync)(this.setting.to);
            (0, fs_extra_1.copySync)(this.setting.from, this.setting.to);
            log('done');
            callback(null, 200);
        }
        catch (ex) {
            callback(ex, 500);
        }
    };
    return OnSafeEngine;
}());
exports.OnSafeEngine = OnSafeEngine;
var ClientEngine = /** @class */ (function () {
    function ClientEngine(from, to, cronjob) {
        this.setting = new Setting(from, to, cronjob);
    }
    ClientEngine.prototype.update = function () {
        this.setting.save();
    };
    return ClientEngine;
}());
exports.ClientEngine = ClientEngine;
//# sourceMappingURL=FileManager.js.map
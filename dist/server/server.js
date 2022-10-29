"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var FileManager_1 = require("./../class/FileManager");
document.addEventListener('before-backup', before);
document.addEventListener('after-backup', after);
document.addEventListener('init-backup', init);
document.addEventListener('error-backup', error);
//gestione degli eventi
/**
 * init --> inizialiazza il cron, scaricando il file
 */
var engine = new FileManager_1.OnSafeEngine();
electron_1.ipcRenderer.on('init', function (e, args) {
    engine.init(log);
});
function before() {
    log('start backup');
}
function after() {
    log('end backup');
}
function init() {
    log('init backup');
}
function error() {
    log('[X] -> ERROR backup');
}
function log(data) {
    electron_1.ipcRenderer.send('logger', data);
}
//# sourceMappingURL=server.js.map
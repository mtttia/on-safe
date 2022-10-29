"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
electron_1.ipcRenderer.on('hello-client', function () {
    console.log('hello world');
});
//# sourceMappingURL=index.js.map
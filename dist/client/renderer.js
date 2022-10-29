"use strict";
/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("./index.css");
require("bootstrap/dist/css/bootstrap.min.css");
var electron_1 = require("electron");
var FileManager_1 = require("../class/FileManager");
document.getElementById('form-base').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
        var source = document.getElementById('txtSource').value;
        var destination = document.getElementById('txtDestination').value;
        var cronjob = document.getElementById('txtCronjob').value;
        var ce = new FileManager_1.ClientEngine(source, destination, cronjob);
        console.log(FileManager_1.FILE_PATH, "->", source, destination);
        ce.update();
        electron_1.ipcRenderer.send('init-server');
    }
    catch (er) {
        console.log(er);
    }
});
//# sourceMappingURL=renderer.js.map
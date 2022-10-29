"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var main_1 = require("@electron/remote/main");
;
(0, main_1.initialize)();
var mainWindow;
var serverWindow;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    electron_1.app.quit();
}
electron_1.app.disableHardwareAcceleration();
var createMainWindow = function () {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    (0, main_1.enable)(mainWindow.webContents);
    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};
var createServerWindow = function () {
    //create server window
    serverWindow = new electron_1.BrowserWindow({
        show: true,
        webPreferences: {
            preload: SERVER_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: false,
            nodeIntegration: true,
        }
    });
    (0, main_1.enable)(serverWindow.webContents);
    serverWindow.webContents.openDevTools();
    serverWindow.loadURL(SERVER_WINDOW_WEBPACK_ENTRY);
};
function loadApp() {
    createServerWindow();
    createMainWindow();
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', loadApp);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        loadApp();
    }
});
electron_1.app.on('second-instance', function () {
    //can be just more than one main windows, but just one server
    if (serverWindow.isDestroyed()) {
        createServerWindow();
    }
    createMainWindow();
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//IPCMAIN
electron_1.ipcMain.on('init-server', function (e, args) {
    serverWindow.webContents.send('init');
});
var cNum = 0;
electron_1.ipcMain.on('logger', function (e, args) {
    console.log('server [' + cNum + '] => ', args);
    cNum++;
});
//# sourceMappingURL=index.js.map
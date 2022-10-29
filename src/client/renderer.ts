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

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ipcRenderer } from 'electron'
import {ClientEngine, FILE_PATH} from '../class/FileManager'

document.getElementById('form-base').addEventListener('submit', (e) => {
  e.preventDefault();
  try {
    let source = (document.getElementById('txtSource') as HTMLInputElement).value;
    let destination = (document.getElementById('txtDestination') as HTMLInputElement).value;
    let cronjob = (document.getElementById('txtCronjob') as HTMLInputElement).value;
    let ce = new ClientEngine(source, destination, cronjob);
    console.log(FILE_PATH, "->", source, destination);
    ce.update();
    ipcRenderer.send('init-server');
  } catch (er)
  {
    console.log(er);
  }
})

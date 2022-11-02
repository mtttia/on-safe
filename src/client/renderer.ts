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

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { ipcRenderer } from 'electron'
import {dialog} from '@electron/remote'
import { ClientEngine, FILE_PATH, OnSafeEngine } from '../class/FileManager'
import 'line-awesome/dist/line-awesome/css/line-awesome.min.css';
import {BackupNotifier, Modal} from '../class/Modal';

document.getElementById('btnBackup').addEventListener('click', (e) =>
{
  console.log('orca madonna');
  
  let from = (document.getElementById('txtSource') as HTMLInputElement).value;
  let to = (document.getElementById('txtDestination') as HTMLInputElement).value;
  let banner = new BackupNotifier(from, to)
  banner.draw();
  OnSafeEngine.liveBackup(from, to, false).then(()=>banner.destroy())
  
})

document.getElementById('form-central').addEventListener('submit', (e) => {
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


//bind source folder
let srcFolders = document.getElementsByClassName('src-folder');
for (let i = 0; i < srcFolders.length; i++)
{
  srcFolders[i].addEventListener('click', async function (e)
  {
    let path = await dialog.showOpenDialog({
      properties: ['openDirectory']      
    })
    
    if (path.filePaths.length < 1) return;

    let iel = (document.getElementById(srcFolders[i].getAttribute('data-source')) as HTMLInputElement)
    iel.value = path.filePaths[0];
  })
}
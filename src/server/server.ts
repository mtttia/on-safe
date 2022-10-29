import { ipcRenderer } from 'electron'
import {OnSafeEngine} from './../class/FileManager'

document.addEventListener('before-backup', before)
document.addEventListener('after-backup', after)
document.addEventListener('init-backup', init)
document.addEventListener('error-backup', error)

//gestione degli eventi

/**
 * init --> inizialiazza il cron, scaricando il file
 */

let engine = new OnSafeEngine();

ipcRenderer.on('init', (e, args) => {
  engine.init(log)
})

function before()
{
  log('start backup')
}

function after()
{
  log('end backup')
}

function init()
{
  log('init backup')
}

function error()
{
  log('[X] -> ERROR backup')
}

  function log(data: string)
  {
    ipcRenderer.send('logger', data);
  }


import { existsSync, writeFileSync, readFileSync } from 'fs'
import { copySync, ensureDirSync } from 'fs-extra'
import path from 'path'
import cron from 'node-cron'
import Rsync from 'rsync';
import { app } from '@electron/remote'
import { ipcRenderer } from 'electron'
function log(data: string)
{
  ipcRenderer.send('logger', data);
}

let basepath = app.getAppPath();

export const FILE_PATH = path.join(basepath, 'config.json')
export const DB_PATH = path.join(basepath, 'db.json')

export const event_before = new CustomEvent('before-backup');
export const event_after = new CustomEvent('after-backup');
export const event_error = new CustomEvent('error-backup');
export const event_init = new CustomEvent('init-backup');

export class Database{

  static getLogs(): Log[]{
    if (existsSync(DB_PATH))
    {
      let data = JSON.parse(readFileSync(DB_PATH, { encoding: 'utf-8' }))
      return Log.listFromJson(data);
    }
    return []
  }

  static saveLog(log: Log): void{
    let logs = Database.getLogs();
    logs.push(log);
    this.saveLogs(logs);
  }

  static saveLogs(logs: Log[])
  {
    let json = JSON.stringify(logs);
    writeFileSync(DB_PATH, json);
  }
}

export class FileManager{
  
  static getContent():string | null
  {
    if (existsSync(FILE_PATH))
    {
      return readFileSync(FILE_PATH, {encoding:'utf-8'})
    }
    return null
  }

  static writeContent(data: string) : void
  {
    writeFileSync(FILE_PATH, data, {encoding:'utf-8'})
  }
}

export class Setting{
  public from: string;
  public to: string;
  public cron: string;

  constructor(from: string, to: string, cron: string)
  {
    this.from = from;
    this.to = to;
    this.cron = cron;
  }

  static loadFromFile(): Promise<Setting> {
    return new Promise((r, e) => {
      let data = FileManager.getContent();
      let setting: Setting;
      if (data)
      {
        let obj:any = JSON.parse(data);
        r(new Setting(obj['from'], obj['to'], obj['cron']));
      }
      else
      {
        r(null)
      }
    })
  }

  toJson(): any{
    return {
      'from': this.from,
      'to': this.to,
      'cron': this.cron
    }
  }
  save(): void
  {
    FileManager.writeContent(JSON.stringify(this.toJson()));
  }

}

export class Log{
  from: string;
  to: string;
  date: Date;
  result: number;
  description: string | null;

  constructor(from: string, to: string, date: Date, result: number, description: string | null = null)
  {
    this.from = from;
    this.to = to;
    this.date = date;
    this.result = result;
    this.description = description;
  }

  static fromJson(json:any): Log{
    return new Log(json.from, json.to, json.date, json.result, json.description);
  }

  static listFromJson(json: any[]): Log[]{
    let lista: Log[] = []
    json.forEach(element => {
      lista.push(Log.fromJson(element));
    });
    return lista;
  }

  get mysqlDate () {
    return `${this.date.getFullYear()}-${this.date.getMonth() + 1}-${this.date.getDate()}`;
  }

  save()
  {
    Database.saveLog(this);
  }

}

export class Cronjob
{
  public _cron: string;
  public callback: ((now: Date) => void);
  public task:cron.ScheduledTask;
  set cron(value:string) {
    if (cron.validate(value)) {
      this._cron = value;
    }
    else {
      throw new Error('cronjob not correct')
    }
  }

  get cron() {
    return this._cron;
  }

  constructor(cronjob: string, callback:((now: Date) => void))
  {
    this.cron = cronjob;
    this.callback = callback;
  }

  init()
  {
    if (cron.validate(this.cron))
    {
      this.task = cron.schedule(this.cron, this.callback);
      this.start(); 
    }
  }

  start()
  {
    log('[Cronjob] => Start ('+ this.cron+ ')')
    this.task.start();
  }

  stop()
  {
    this.task.stop();
  }

  destroy()
  {
    this.stop();
    this.task = null;
  }
}

export class OnSafeEngine{
  setting: Setting;
  cronjob: Cronjob;
  isLoading: boolean;
  log: Function;

  async init(log:Function): Promise<void>{
    this.setting = await Setting.loadFromFile();
    this.cronjob = new Cronjob(this.setting.cron, this.backup.bind(this))
    this.cronjob.init()
    this.log = log;
    document.dispatchEvent(event_init);
    log(this.setting.toJson())
  }

  backup(now: Date)
  {
    document.dispatchEvent(event_before)
    const from = this.setting.from;
    const to = this.setting.to;   
    OnSafeEngine.backupEngine(from, to, true)
    document.dispatchEvent(event_after)
  }

  static liveBackup(from: string, to: string, saveLog: boolean = true)
  {
    return new Promise((r, e) =>
    {
      this.backupEngine(from, to, saveLog)
      r(0)
    })
  }

  static backupEngine(from: string, to: string, saveLog:boolean = true)
  {
    const start = new Date();
    let code = 200;
    let err = 'ok';
    try
    {
      ensureDirSync(from);
      ensureDirSync(to);
      copySync(from, to)
      document.dispatchEvent(event_after)
    } catch (ex)
    {
      err = ex
      code = 500;
    }    
    if (saveLog)
    {
      let log = new Log(from, to, start, code, err);
      log.save()
    }
  }

  /**
   * copy a folder in to anather with fs-extra
   * @param callback called when copy process finish, error => the error occurred, code => 200:ok, 500:error
   */
  copyDir(callback:(error:Error, code:number)=>void)
  {
    try
    {
      log('near')
      ensureDirSync(this.setting.from);
      ensureDirSync(this.setting.to);
      copySync(this.setting.from, this.setting.to)
      callback(null, 200)
    } catch (ex)
    {
      callback(ex, 500)
    }
  }
}

export class ClientEngine{
  setting: Setting;

  constructor(from: string, to: string, cronjob: string)
  {
    this.setting = new Setting(from, to, cronjob)    
  }

  update()
  {
    this.setting.save()
  }
}
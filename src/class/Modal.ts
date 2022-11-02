export class Modal
{
  public id: string;
  public waiting: boolean;
  public header: string;
  public body: string;
  public footer: string;
  
  constructor(id:string, waiting:boolean=false) {
    this.id = id;
    this.waiting = waiting
  }

  getHtml()
  {
    let el = `<div class="os-modal" id="${this.id}">`

    if (this.waiting)
    {
      //is a loading modal
      el += `<div>
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>`
    }
    else
    {
      //is a content modal
      if (this.header)
      {
        el += `
          <div class="os-modal-header">
            ${this.header}
          </div> 
        ` 
      }
      if (this.body)
      {
        el += `
          <div class="os-modal-body">
            ${this.body}
          </div> 
        ` 
      }
      if (this.footer)
      {
        el += `
          <div class="os-modal-footer">
            ${this.footer}
          </div> 
        ` 
      }
    }
    el += '</div>';

    return el;
  }

  draw()
  {
    //metto il modal all'inizio del body
    document.getElementById('fuck-body').innerHTML += this.getHtml()
  }

  show()
  {
    if (document.getElementById(this.id))
      document.getElementById(this.id).style.display = 'flex';
  }

  drawAndShow()
  {
    this.draw();
    this.show()
  }

  hide()
  {
    if (document.getElementById(this.id))
      document.getElementById(this.id).style.display = 'none';
  }

  destroy()
  {
    if (document.getElementById(this.id))
      document.getElementById(this.id).remove();
  }

  hideAndDestroy()
  {
    this.hide();
    this.destroy();
  }
}

export class BackupNotifier
{
  public from: String;
  public to: String;
  constructor(from:string, to:string, add:boolean = true) {
    this.from = from;
    this.to = to;
    if (add)
    {
      this.draw()
    }
  }

  getHtml()
  {
    let el = `
      <div class="os-backup-live" id="bnr-backup">
        <p>
          ${this.from} - ${this.to}, running...
        </p>
      </div>
    `
    return el;
  }

  draw()
  {
    let el = this.getHtml();
    document.getElementById('banner').innerHTML = el;
  }

  destroy()
  {
    document.getElementById('bnr-backup').remove();
  }
}
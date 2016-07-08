'use strict'
const yargs = require('yargs')
const temp = require('temp')
const path = require('path')
const {app, BrowserWindow} = require('electron')

class Scanner {
  run (url, cb) {
    this.url = url
    this.cb = cb
    process.on('uncaughtException', /* istanbul ignore next */ function (err) {
      console.error(err)
      app.exit(1)
    })
    app.once('ready', /* istanbul ignore next */ () => this.onReady())
  }

  onReady () {
    const options = { frame: true, height: 768, width: 1024, x: 0, y: 0, show: false }
    this.win = new BrowserWindow(options)
    this.win.webContents.once('did-stop-loading', () => this.grabPage())
    this.win.loadURL(this.url)
  }

  grabPage () {
    temp.track()
    const dir = temp.mkdirSync('scanner')
    this.filename = path.join(dir, 'page.html')
    console.log(`Saving to ${this.filename}`)
    this.win.webContents.savePage(this.filename, 'HTMLOnly', () => this.scanPage())
  }

  scanPage (error) {
    // Do the scan here, HTML source is in this.filename
    // istanbul ignore else
    if (this.cb) {
      this.cb(error) // Assume caller will quit the app.
    } else {
      if (error) {
        console.error(error)
        app.exit(1)
      } else {
        app.quit()
      }
    }
  }
}

// istanbul ignore if
if (!module.parent || module.parent.id === '.') {
  const argv = yargs
        .usage('Usage: $0 URL')
        .demand(1)
        .strict()
        .version()
        .help('h')
        .argv
  const s = new Scanner()
  s.run(argv._[0])
} else {
  module.exports = Scanner
}

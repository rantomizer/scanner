'use strict'
const {app, BrowserWindow} = require('electron')
const yargs = require('yargs')
const temp = require('temp')
const path = require('path')

process.on('uncaughtException', function (err) {
  console.error(err)
  app.quit()
})

var win, filename, url

function onReady () {
  const options = { frame: false, height: 768, width: 1024, x: 0, y: 0, show: false }
  win = new BrowserWindow(options)
  win.webContents.once('did-stop-loading', grabPage)
  win.loadURL(url)
}

function grabPage () {
  temp.track()
  const dir = temp.mkdirSync('scanner')
  filename = path.join(dir, 'page.html')
  console.log(`Saving to ${filename}`)
  win.webContents.savePage(filename, 'HTMLOnly', scanPage)
}

function scanPage (error) {
  // Do the scan here, HTML source is in filename
  app.quit()
  if (error) {
    console.error(error)
    process.exit(-1)
  }
}

const argv = yargs
  .usage('Usage: $0 URL')
  .demand(1)
  .strict()
  .version()
  .help('h')
  .argv

url = argv._[0]
app.once('ready', onReady)

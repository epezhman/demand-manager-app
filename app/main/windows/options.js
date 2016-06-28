var options = module.exports = {
    dispatch,
    init,
    send,
    setTitle,
    show,
    toggleDevTools,
    win: null
}

var electron = require('electron')

var config = require('../../config')
var log = require('../../lib/log')


function init () {
    if (options.win) {
        return options.win.show()
    }
    var win = options.win = new electron.BrowserWindow({
        icon: getIconPath(), // Window icon (Windows, Linux)
        minWidth: config.WINDOW_MIN_WIDTH,
        minHeight: config.WINDOW_MIN_HEIGHT,
        show: false, // Hide window until renderer sends 'ipcReady'
        title: config.APP_WINDOW_TITLE,
        titleBarStyle: 'hidden-inset', // Hide title bar (OS X)
        useContentSize: true, // Specify web page size without OS chrome
        width: 500,
        height: 400
    })

    win.loadURL(config.WINDOW_OPTIONS)
    
    win.webContents.on('dom-ready', function () {
    })

    win.on('close', function (e) {
        
    })
}

function dispatch (...args) {
    send('dispatch', ...args)
}

function send (...args) {
    if (!options.win) return
    options.win.send(...args)
}

function setTitle (title) {
    if (!options.win) return
    options.win.setTitle(title)
}

function show () {
    if (!options.win) return
    options.win.show()
}

function toggleDevTools () {
    if (!options.win) return
    log('toggleDevTools')
    if (options.win.webContents.isDevToolsOpened()) {
        options.win.webContents.closeDevTools()
    } else {
        options.win.webContents.openDevTools({ detach: true })
    }
}

function getIconPath () {
    return process.platform === 'win32'
        ? config.APP_ICON + '.ico'
        : config.APP_ICON + '.png'
}

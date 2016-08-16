var notify = module.exports = {
    init,
    win: null
}

const electron = require('electron')
const config = require('../../config')

function init(msg) {

    if (notify.win) {
        return notify.win.webContents.send('notify', msg)
    }
    var win = notify.win = new electron.BrowserWindow({
        icon: config.APP_ICON,
        title: config.APP_WINDOW_TITLE + ' - Notify',
        show: false
    })

    win.loadURL(config.WINDOW_NOTIFY)

    win.setMenu(null)

    win.webContents.on('did-frame-finish-load', ()=> {
        win.webContents.send('notify', msg)
    })
    win.once('closed', (e) => notify.win = null)
}
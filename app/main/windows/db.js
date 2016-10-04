var db = module.exports = {
    runQuery,
    win: null
}

const electron = require('electron')
const config = require('../../config')
const getMenu = require('../../lib/menu-template')

function runQuery(op) {

    if (db.win) {
        return db.win.webContents.send('db', op)
    }
    var win = db.win = new electron.BrowserWindow({
        icon: config.APP_ICON,
        title: config.APP_WINDOW_TITLE + ' - Database',
        show: false
    })

    win.loadURL(config.WINDOW_DB)

    win.setMenu(electron.Menu.buildFromTemplate(getMenu()))

    win.webContents.on('did-frame-finish-load', ()=> {
        win.webContents.send('db', op)
    })
    win.once('closed', (e) => db.win = null)
}
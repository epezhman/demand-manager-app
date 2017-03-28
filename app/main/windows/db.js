let db = module.exports = {
    runQuery,
    win: null
}

const electron = require('electron')
const config = require('../../config')

function runQuery(op) {

    if (db.win) {
        return db.win.webContents.send('db', op)
    }
    let win = db.win = new electron.BrowserWindow({
        icon: config.APP_ICON,
        title: config.APP_WINDOW_TITLE + ' - Database',
        width: 400,
        height: 200,
        show: false
    })

    win.loadURL(config.WINDOW_DB)

    if (config.IS_DEVELOPMENT) {
        const getMenu = require('../../lib/menu-template')
        win.setMenu(electron.Menu.buildFromTemplate(getMenu()))
    }
    else {
        win.setMenu(null)
    }

    // if (config.IS_DEVELOPMENT) {
    //     win.webContents.openDevTools()
    // }

    win.webContents.on('did-frame-finish-load', ()=> {
        win.webContents.send('db', op)
    })
    win.once('closed', (e) => db.win = null)
}
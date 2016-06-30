var status = module.exports = {
    init,
    win: null
}

const electron = require('electron')

const config = require('../../config')
const log = require('../../lib/log')
const getMenu = require('../../lib/menu-template')


function init() {
    if (status.win) {
        status.win.show()
        if (status.win.isMinimized()){
            status.win.restore()
        } 
        return status.win.focus()
    }
    var win = status.win = new electron.BrowserWindow({
        backgroundColor: '#ECECEC',
        center: true,
        fullscreen: false,
        height: 400,
        icon: config.APP_ICON,
        maximizable: false,
        minimizable: false,
        resizable: false,
        title: config.APP_WINDOW_TITLE + ' - Status',
        useContentSize: true,
        width: 800
    })

    win.loadURL(config.WINDOW_STATUS)

    win.setMenu(electron.Menu.buildFromTemplate(getMenu()))

    win.once('closed', (e) => status.win = null)
}
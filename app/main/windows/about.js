var about = module.exports = {
    init,
    win: null
}

const electron = require('electron')

const config = require('../../config')
const log = require('../../lib/log')
const getMenu = require('../../lib/menu-template')


function init() {
    if (about.win) {
        about.win.show()
        if (about.win.isMinimized()) 
        {
            about.win.restore()
        }
        return about.win.focus()
    }
    var win = about.win = new electron.BrowserWindow({
        backgroundColor: '#ECECEC',
        center: true,
        fullscreen: false,
        height: 400,
        icon: config.APP_ICON,
        maximizable: false,
        minimizable: false,
        resizable: false,
        title: config.APP_WINDOW_TITLE + '- About',
        useContentSize: true,
        width: 800
    })

    win.loadURL(config.WINDOW_ABOUT)

    win.setMenu(electron.Menu.buildFromTemplate(getMenu()))

    win.once('closed', (e) => about.win = null)
}
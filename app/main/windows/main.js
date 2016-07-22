var main = module.exports = {
    init,
    win: null
}

const electron = require('electron')

const config = require('../../config')
const log = require('../../lib/log')
const getMenu = require('../../lib/menu-template')


function init(windowType) {
    if (main.win) {
        main.win.webContents.send('selected-window', windowType)
        if (!main.win.isVisible()) {
            main.win.show()
        }
        if (main.win.isMinimized()) {
            main.win.restore()
        }
        return main.win.focus()
    }
    var win = main.win = new electron.BrowserWindow({
        backgroundColor: '#ECECEC',
        center: true,
        fullscreen: false,
        icon: config.APP_ICON,
        maximizable: false,
        minimizable: false,
        resizable: false,
        title: config.APP_WINDOW_TITLE,
        useContentSize: true,
        width: 800,
        height: 400,
        show: false
    })

    win.loadURL(config.WINDOW_MAIN)

    win.setMenu(electron.Menu.buildFromTemplate(getMenu()))

    win.once('closed', (e) => main.win = null)

    win.webContents.on('did-frame-finish-load', function () {
        win.webContents.send('selected-window', windowType)
    })

    win.once('ready-to-show', () => win.show())
}
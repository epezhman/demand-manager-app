var gelocation = module.exports = {
    init,
    win: null
}

const electron = require('electron')
const config = require('../../config')

function init(locationCommand) {

    if (gelocation.win) {
        return gelocation.win.webContents.send(locationCommand, true)
    }
    var win = gelocation.win = new electron.BrowserWindow({
        icon: config.APP_ICON,
        title: config.APP_WINDOW_TITLE + ' - Gelocation',
        width: 400,
        height: 200,
        show: false
    })

    win.loadURL(config.WINDOW_GEOLOCATION)

    win.webContents.on('did-frame-finish-load', ()=> {
        win.webContents.send(locationCommand, true)
    })

    win.once('closed', (e) => gelocation.win = null)

    if (config.IS_DEVELOPMENT) {
        const getMenu = require('../../lib/menu-template')
        win.setMenu(electron.Menu.buildFromTemplate(getMenu()))
    }
    else {
        win.setMenu(null)
    }
}
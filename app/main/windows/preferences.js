var preferences = module.exports = {
    init,
    win: null
}

const electron = require('electron')

const config = require('../../config')
const log = require('../../lib/log')
const getMenu = require('../../lib/menu-template')


function init() {
    if (preferences.win) {         
        preferences.win.show()
        if (preferences.win.isMinimized()) 
        {
            preferences.win.restore()
        }
        return preferences.win.focus()
    }
    var win = preferences.win = new electron.BrowserWindow({
        backgroundColor: '#ECECEC',
        fullscreen: false,
        icon: config.APP_ICON,
        maximizable: false,
        minimizable: false,
        resizable: false,
        title: config.APP_WINDOW_TITLE + ' - Preferences',
        useContentSize: true,
        width: 600,
        height: 400,
        show:false
    })

    win.loadURL(config.WINDOW_PREFERENCES)

    win.setMenu(electron.Menu.buildFromTemplate(getMenu()))
    
    win.once('closed', (e) => preferences.win = null)

    win.once('ready-to-show', () => {
        win.show()
    })

}

'use strict'

module.exports = getMenu

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const windows = require('../main/windows')
const updater = require('./updater')
const config = require('../config')
const powerControl = require('./power-control')
const enums = require('./enums')
const log = require('./log')

function getMenu() {
    var template = [{
        label: 'File',
        submenu: [{
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+P',
            click: () => windows.main.init(enums.WindowType.SETTINGS)
        }, {
            label: 'Status',
            click: () => windows.main.init(enums.WindowType.STATUS)
        }, {
            type: 'separator'
        }, {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => app.quit()
        }]
    }, {
        label: 'Help',
        submenu: [{
            label: 'Check for Updates',
            click: () => updater.checkUpdate(true)
        }, {
            type: 'separator'
        }, {
            label: 'About',
            click: () => windows.main.init(enums.WindowType.ABOUT)
        }]
    }, {
        label: 'Development',
        submenu: [{
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: ()=> {
                BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache()
            }
        }, {
            label: 'Toggle DevTools',
            accelerator: 'Alt+CmdOrCtrl+I',
            click: ()=> {
                BrowserWindow.getFocusedWindow().toggleDevTools({detach: true})
            }
        }]
    }]

    if (config.IS_DEVELOPMENT) {
        template.push({
            label: 'Experimental',
            submenu: [{
                label: 'Toggle Energy Mode',
                click: () => {
                    powerControl()
                }
            }, {
                label: 'Clear All Storage',
                click: ()=> {
                    const ConfigStore = require('configstore')
                    const conf = new ConfigStore(config.APP_SHORT_NAME)
                    conf.clear()
                }
            }]
        })
    }
    return template
}


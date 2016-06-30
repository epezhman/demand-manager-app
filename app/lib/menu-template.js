'use strict'

module.exports = getMenu

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const windows = require('../main/windows')
const updater = require('../lib/updater')
const config = require('../config')
const powerControl = require('../lib/power-control')


function getMenu() {
    var template = [{
        label: 'File',
        submenu: [{
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+P',
            click: () => windows.preferences.init()
        }, {
            label: 'Status',
            click: () => windows.status.init()
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
            click: () => windows.about.init()
        }]
    }, {
        label: 'Development',
        submenu: [{
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: function () {
                BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache()
            }
        }, {
            label: 'Toggle DevTools',
            accelerator: 'Alt+CmdOrCtrl+I',
            click: function () {
                BrowserWindow.getFocusedWindow().toggleDevTools({detach: true})
            }
        }]
    }]

    if (config.IS_DEVELOPMENT) {
        template.push({
            label: 'Experimental',
            submenu: [{
                label: 'Toggle Energy Mode',
                click: function () {
                    powerControl()
                }
            }]
        })
    }
    return template
}

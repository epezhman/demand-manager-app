'use strict'

if (require('electron-squirrel-startup')) {
    return
}

const electron = require('electron')
const app = electron.app

const config = require('../config')

const windows = require('./windows')

const crashReporter = require('../lib/crash-reporter')
const tray = require('../lib/tray')
const autoStart = require('../lib/auto-start')
const machineId = require('../lib/machine-id')
const updater = require('../lib/updater')

app.on('will-finish-launching', () => {
    crashReporter.init({'scope': 'main'})
})

app.on('window-all-closed', () => {
})

app.on('quit', () => {
})

app.on('ready', () => {
    tray.init()
    windows.about.init()
    autoStart.init()
    machineId.init()
    if (!config.IS_DEVELOPMENT) {
        updater.init()
    }
})

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
const machineIdInit = require('../lib/machine-id')
const updater = require('../lib/updater')
const monitor = require('../lib/monitor')
const firebase = require('../lib/firebase')
const enums = require('../lib/enums')

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    windows.main.init(enums.WindowType.ABOUT)
})

if (shouldQuit) {
    app.quit()
    return
}

global.machineId = null


function delayedStart() {
    monitor.init()
    firebase.enableOfflineCapabilities()
    if (!config.IS_DEVELOPMENT) {
        updater.init()
    }
}

app.on('will-finish-launching', () => {
    crashReporter.init({'scope': 'main'})
    machineIdInit.init()
    if (!config.IS_DEVELOPMENT) {
        autoStart.init()
    }
})

app.on('window-all-closed', () => {
})

app.on('quit', () => {
})

app.on('ready', () => {
    windows.main.init(enums.WindowType.ABOUT)
    tray.init()
    setTimeout(delayedStart, config.DELAY_START_TIME)
})

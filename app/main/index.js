'use strict'

if (require('electron-squirrel-startup')) {
    return
}

const electron = require('electron')
const app = electron.app
const ConfigStore = require('configstore')

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
const env = require('../lib/envs')

const conf = new ConfigStore(config.APP_SHORT_NAME)

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
    firebase.installedVersion()
    if (!config.IS_DEVELOPMENT) {
        updater.init()
    }
}

app.on('will-finish-launching', () => {
    env()
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
    if (!conf.get('first-time-start')) {
        windows.main.init(enums.WindowType.ABOUT)
        conf.set('first-time-start', true)
    }
    tray.init()
    setTimeout(delayedStart, config.DELAY_START_TIME)
    setTimeout(monitor.extractDevicesData, config.DELAY_START_TIME_FIRST_TIME)
    electron.powerMonitor.on('resume', () => {
        firebase.enableOfflineCapabilities()
    })
})

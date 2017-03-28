'use strict'

if (require('electron-squirrel-startup')) {
    return
}

const electron = require('electron')
const app = electron.app
const ConfigStore = require('configstore')
const log = require('../lib/log')

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
const powerControl = require('../lib/power-control')
const db = windows.db


const conf = new ConfigStore(config.APP_SHORT_NAME)

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    windows.main.init(enums.WindowType.ABOUT)
})

if (shouldQuit) {
    app.quit()
    return
}

global.machineId = null


let firebaseWatchers = null

function delayedStart() {
    monitor.init()
    monitor.initDMFlags()
    powerControl.init()
    firebase.enableOfflineCapabilities()
    firebase.installedVersion()
    firebaseWatchers = firebase.firebaseWatchers()
    if (!config.IS_DEVELOPMENT) {
        updater.init()
    }
}

function initDB() {
    db.runQuery({
        'fn': 'getDB',
        'params': []
    })
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
    initDB()
    electron.powerMonitor.on('resume', () => {
        firebase.enableOfflineCapabilities()
        firebaseWatchers = firebase.firebaseWatchers()
        monitor.initDMFlags()
    })
})

process.on('uncaughtException', (err) => {
    log.sendError(err)
});
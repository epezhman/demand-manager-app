'use strict'

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
const powerModel = require('../lib/power-model')
const db = windows.db

process.on('uncaughtException', (err) => {
    log.sendError(err)
});

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
let monitorTimeouts = null
let powerControlTimeout = null
let updaterTimeout = null

function delayedStart() {
    monitorTimeouts = monitor.init()
    powerControlTimeout = powerControl.init()
    powerModel.init()
    firebaseWatchers = firebase.firebaseWatchers()
    firebase.init()
    if (!config.IS_DEVELOPMENT) {
        updaterTimeout = updater.init()
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
    firebase.signInAnonymously()
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

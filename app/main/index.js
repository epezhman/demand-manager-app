'use strict'

if (require('electron-squirrel-startup')) {
    return
}

const electron = require('electron')
const {app} = electron
const {BrowserWindow} = electron
const os = require('os')
const {crashReporter} = require('electron')
const {autoUpdater} = electron
let mainWindow
const config = require('../config')
const update = require('./updater')

var isDevelopment = process.env.NODE_ENV === 'development'


function createWindow() {

    mainWindow = new BrowserWindow({width: 800, height: 600})

    mainWindow.loadURL(config.WINDOW_INDEX)

    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    if (!isDevelopment) {
        mainWindow.webContents.on('did-frame-finish-load', function () {
            console.log('Checking for updates: ')
            update.init()
        })
    }

}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    //process.crash()
    app.quit()
})

app.on('will-finish-launching', function () {
    crashReporter.start({
        productName: 'Demand Management App',
        companyName: 'TUM',
        submitURL: 'http://188.166.160.83/crash_report/post',
        autoSubmit: true,
        extra: {
            'extra1': 'extra1',
            'extra2': 'extra2'
        }
    })
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

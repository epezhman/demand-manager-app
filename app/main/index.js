'use strict'

if (require('electron-squirrel-startup')) {
    return
}

const electron = require('electron')
const {app} = electron
const {BrowserWindow} = electron
const os = require('os')
var crashReporter = require('./crash-reporter')
const {autoUpdater} = electron
let mainWindow
const config = require('../config')
const update = require('./updater')

var isDevelopment = process.env.NODE_ENV === 'development'


module.exports.messs = function messs(msg) {

    mainWindow.webContents.send('update-message', msg);

}

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
    
    app.quit()
})

app.on('will-finish-launching', function () {
    crashReporter.init({'scope':'main'})
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

//var crashReporter = require('./crash-reporter')
//const {crashReporter} = require('electron');


let mainWindow

function createWindow() {

    mainWindow = new BrowserWindow({width: 800, height: 600})

    mainWindow.loadURL(`file://${__dirname}/index.html`)

    //mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    app.quit()
})

app.on('will-finish-launching', function () {
    // crashReporter.start({
    //   productName: 'Demand Management App',
    //   companyName: 'TUM',
    //   submitURL: 'http://46.101.145.118:1127/post',
    //   autoSubmit: true,
    //   extra: {
    //     'extra1': 'extra1',
    //     'extra2': 'extra2',
    //   }
    // });
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

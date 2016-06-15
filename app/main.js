

if (require('electron-squirrel-startup')) return;

const electron = require('electron')
const {app} = electron;
const {BrowserWindow} = electron;
const os = require('os');
// //var crashReporter = require('./crash-reporter')
const {crashReporter} = require('electron');
const {autoUpdater} = electron;
let mainWindow

var updateFeed = 'http://188.166.160.83/auto_update/download/latest';
var isDevelopment = process.env.NODE_ENV == 'development';
var feedURL = "";

// Don't use auto-updater if we are in development
if (!isDevelopment) {
    if (os.platform() === 'darwin') {
        updateFeed = 'https://s3.eu-central-1.amazonaws.com/demand-manager-resources/updates/latest/osx';
    }
    else if (os.platform() === 'win32') {
        updateFeed = 'https://s3.eu-central-1.amazonaws.com/demand-manager-resources/updates/latest/win' + (os.arch() === 'x64' ? '64' : '32');
    }

    autoUpdater.addListener("update-available", function (event) {
        console.log("A new update is available")
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-available');
        }
    });
    autoUpdater.addListener("update-downloaded", function (event, releaseNotes, releaseName, releaseDate, updateURL) {
        console.log("A new update is ready to install", `Version ${releaseName} is downloaded and will be automatically installed on Quit`)
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-downloaded');
        }
    });
    autoUpdater.addListener("error", function (error) {
        console.log(error)
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-error');
        }
    });
    autoUpdater.addListener("checking-for-update", function (event) {
        console.log("checking-for-update")
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'checking-for-update');
        }
    });
    autoUpdater.addListener("update-not-available", function () {
        console.log("update-not-available")
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-not-available');
        }
    });

    const appVersion = require('./package.json').version;
     feedURL = updateFeed + '?v=' + appVersion;
    autoUpdater.setFeedURL(feedURL);
}


function createWindow() {

    mainWindow = new BrowserWindow({width: 800, height: 600})

    mainWindow.loadURL(`file://${__dirname}/index.html`)

    //mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
    
    if (!isDevelopment) {
        mainWindow.webContents.on('did-frame-finish-load', function() {
            console.log("Checking for updates: " + feedURL);
            autoUpdater.checkForUpdates();
        });
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
    });
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

'use strict'

module.exports = {
    hasTray,
    init
}

const electron = require('electron')
const app = electron.app

const config = require('../config')
const windows = require('../main/windows')
const enums = require('./enums')

let tray

const getMenuTemplate = () => {
    return [
        {
            label: 'Status',
            click: () => windows.main.init(enums.WindowType.STATUS)
        },
        {
            label: 'Preferences',
            click: () => windows.main.init(enums.WindowType.SETTINGS)
        },
        {type: 'separator'},
        {
            label: 'About',
            click: () => windows.main.init(enums.WindowType.ABOUT)
        },
        {type: 'separator'},
        {
            label: 'Quit',
            click: () => app.quit()
        }
    ]
}

/**
 * Check for libappindicator1 support before creating tray icon
 */
const checkLinuxTraySupport = (cb)=> {
    let cp = require('child_process')

    // Check that we're on Ubuntu (or another debian system) and that we have
    // libappindicator1. If app was installed from the deb file, we should
    // always have it. If it was installed from the zip file, we might not.
    cp.exec('dpkg --get-selections libappindicator1', (err, stdout)=> {
        if (err) {
            return cb(false)
        }
        // Unfortunately there's no cleaner way, as far as I can tell, to check
        // whether a debian package is installed:
        cb(stdout.endsWith('\tinstall\n'))
    })
}

const updateTrayMenu = () => {
    let contextMenu = electron.Menu.buildFromTemplate(getMenuTemplate())
    tray.setContextMenu(contextMenu)
}

const createTray = ()=> {
    tray = new electron.Tray(config.APP_ICON_MENU)

    // On Windows, left click opens the app, right click opens the context menu.
    // On Linux, any click (left or right) opens the context menu.
    tray.on('click', () => windows.main.init(enums.WindowType.ABOUT))

    // Show the tray context menu, and keep the available commands up to date
    updateTrayMenu()
    tray.setToolTip(config.APP_NAME)
}


const initLinux = ()=> {
    checkLinuxTraySupport((supportsTray)=> {
        if (supportsTray) {
            createTray()
        }
    })
}

const initWin32 = () => {
    createTray()
}

/**
 * Returns true if there a tray icon is active.
 */
function hasTray() {
    return !!tray
}

function init() {
    if (config.IS_LINUX) {
        initLinux()
    }
    else {
        initWin32()
    }
}

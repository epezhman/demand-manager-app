'use strict'

module.exports = {
    init,
    checkUpdate
}

const os = require('os')
const path = require('path')
const {autoUpdater, app} = require('electron')
const request = require('request')
const https = require('https')
const fs = require('fs')
const isOnline = require('is-online')
const sudo = require('sudo-prompt')

const config = require('../config')
const log = require('./log')
const notify = require('./notify')

var manualUpdate = false


function installUpdate(downloadPath) {
    notify(`The latest version of the ${config.APP_NAME} is being installed.`)
    sudo.exec(`dpkg -i ${downloadPath}`, {name: config.APP_NAME}, (lshwJsonErr, lshwJsonStdout, lshwJsonStderr) => {
        if (lshwJsonErr) {
            log.error(lshwJsonErr)
            return notify(`The update could not be installed. 
            The latest version of ${config.APP_NAME} can be found in your home dir, please update it.`)
        }
        log(lshwJsonStdout)
        notify(`Update was installed successfully.`)
        app.relaunch({args: process.argv.slice(1) + ['--relaunch']})
        app.exit(0)
    })
}

function onLinuxResponse(err, res, data) {
    if (err) {
        return log.error(`Update error: ${err.message}`)
    }
    if (res.statusCode === 200) {
        if (manualUpdate) {
            notify('Update is available and will be downloaded to your home directory.')
        }
        log('update available')
        data = JSON.parse(data)
        var downloadPath = path.resolve(process.env.HOME || process.env.USERPROFILE) +
            `/${data.file}`
        fs.access(downloadPath, fs.F_OK, (error)=> {
            if (error) {
                var newVersionFile = fs.createWriteStream(downloadPath)
                https.get(data.url, (response) => {
                    response.pipe(newVersionFile).on('close', ()=> {
                        installUpdate(downloadPath)
                        log('downloaded')
                    })
                })
            }
            else {
                installUpdate(downloadPath)
                log('file exist')
            }
        })

    } else if (res.statusCode === 204) {
        if (manualUpdate) {
            notify('No new update is available.')
        }
        log('No updates for linux')
    } else {
        // Unexpected status code
        log.error(`Update error: Unexpected status code: ${res.statusCode}`)
    }
}

function initLinux() {
    var feedURL = config.AUTO_UPDATE_LINUX_BASE_URL + (os.arch() === 'x64' ? '64' : '32') +
        '?v=' + config.APP_VERSION
    request(feedURL, onLinuxResponse)
}


autoUpdater.on(
    'error',
    (err) => {
        notify(`Update error: ${err.message}`)
        log.error(`Update error: ${err.message}`)
    }
)

autoUpdater.on(
    'checking-for-update',
    () => {
        log('Checking for update')
    }
)

autoUpdater.on(
    'update-available',
    () => {
        if (manualUpdate) {
            notify('Update is available and will be installed automatically.')
        }
        log('Update available')
    }
)

autoUpdater.on(
    'update-not-available',
    () => {
        if (manualUpdate) {
            notify('No new update is available.')
        }
        log('Update not available')
    }
)

autoUpdater.on(
    'update-downloaded',
    (e, notes, name, date, url) => {
        log(`Update downloaded: ${name}: ${url}`)
        autoUpdater.quitAndInstall()
    }
)

function initDarwinWin32() {
    var feedURL = ''
    if (config.IS_OSX) {
        feedURL = config.AUTO_UPDATE_OSX_BASE_URL
    }
    else if (config.IS_WINDOWS) {
        feedURL = config.AUTO_UPDATE_WIN_BASE_URL + (os.arch() === 'x64' ? '64' : '32')
    }

    feedURL += '?v=' + config.APP_VERSION
    autoUpdater.setFeedURL(feedURL)
    autoUpdater.checkForUpdates()
}

function checkUpdate(manual) {
    manualUpdate = !!manual
    isOnline(function (err, online) {
        if (online) {
            if (config.IS_LINUX) {
                initLinux()
            } else {
                initDarwinWin32()
            }
        }
        else {
            if (manualUpdate) {
                notify('No internet connection')
            }
        }
    })
}

function init() {
    checkUpdate()
    setTimeout(init, config.AUTO_UPDATE_CHECK_INTERVAL)
}


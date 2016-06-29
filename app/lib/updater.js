'use strict'

module.exports = {
    init,
    checkUpdate
}

const os = require('os')
const path = require('path')
const {autoUpdater} = require('electron')
const request = require('request')
const https = require('https')
const fs = require('fs')
const config = require('../config')
const log = require('./log')
const notify = require('./notify')

var feedURL = ''
var manualUpdate = false

var onLinuxResponse = (err, res, data) => {
    if (err) {
        return log.error(`Update error: ${err.message}`)
    }
    if (res.statusCode === 200) {
        if (manualUpdate) {
            notify('Update is available and will be downloaded to your home directory.')
        }
        data = JSON.parse(data)
        var downloadPath = path.resolve(process.env.HOME || process.env.USERPROFILE) +
            `/${data.file}`
        fs.access(downloadPath, fs.F_OK, (error)=> {
            if (error) {
                var newVersionFile = fs.createWriteStream(downloadPath)
                https.get(data.url, (response) => {
                    response.pipe(newVersionFile).on('close', ()=> {
                        log('downloaded')
                    })
                })
            }
            else {
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

var initLinux = () => {
    feedURL = config.AUTO_UPDATE_LINUX_BASE_URL + (os.arch() === 'x64' ? '64' : '32') +
        '?v=' + config.APP_VERSION
    request(feedURL, onLinuxResponse)
}

var initDarwinWin32 = () => {

    if (process.platform === 'darwin') {
        feedURL = config.AUTO_UPDATE_OSX_BASE_URL
    }
    else if (process.platform === 'win32') {
        feedURL = config.AUTO_UPDATE_WIN_BASE_URL + (os.arch() === 'x64' ? '64' : '32')
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
        (e, notes, name, date, url) => log(`Update downloaded: ${name}: ${url}`)
    )

    feedURL += '?v=' + config.APP_VERSION
    autoUpdater.setFeedURL(feedURL)
    autoUpdater.checkForUpdates()
}

function checkUpdate(manual) {
    manualUpdate = !!manual
    if (process.platform === 'linux') {
        initLinux()
    } else {
        initDarwinWin32()
    }
}

function init() {
    checkUpdate()

    setTimeout(init, config.AUTO_UPDATE_CHECK_INTERVAL)
}

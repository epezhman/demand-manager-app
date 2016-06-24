'use strict'

module.exports = {
    init
}

const os = require('os')
const path = require('path')
const {autoUpdater} = require('electron')
const request = require('request')
var https = require('https')
var fs = require('fs')
const config = require('../config')
const log = require('../lib/log')

const index = require('./index')

var feedURL = ''


var onLinuxResponse = (err, res, data) => {
    if (err) {
        return log.error(`Update error: ${err.message}`)
    }
    if (res.statusCode === 200) {
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
        feedURL = config.AUTO_UPDATE_LINUX_BASE_URL
    }
    else if (process.platform === 'win32') {
        feedURL = config.AUTO_UPDATE_WIN_BASE_URL + (os.arch() === 'x64' ? '64' : '32')
    }

    autoUpdater.on(
        'error',
        (err) => {
            index.messs(err.message)
            log.error(`Update error: ${err.message}`)
        }
    )

    autoUpdater.on(
        'checking-for-update',
        () => log('Checking for update')
    )

    autoUpdater.on(
        'update-available',
        () => log('Update available')
    )

    autoUpdater.on(
        'update-not-available',
        () => log('Update not available')
    )

    autoUpdater.on(
        'update-downloaded',
        (e, notes, name, date, url) => log(`Update downloaded: ${name}: ${url}`)
    )

    feedURL += '?v=' + config.appVersion
    autoUpdater.setFeedURL(feedURL)
    autoUpdater.checkForUpdates()
}


function init() {
    if (process.platform === 'linux') {
        initLinux()
    } else {
        initDarwinWin32()
    }
}
'use strict'

module.exports = {
    init,
    monitorGeoLocation,
    monitorWindows,
    monitorLinux,
    monitorOSX
}

const config = require('../config')
const windows = require('../main/windows')
const windowsExtractor = require('./windows-device-analyzer')
const linuxExtractor = require('./linux-device-analyzer')
const osxExtractor = require('./osx-device-analyzer')

function monitorGeoLocation() {
    windows.gelocation.init()
    setTimeout(monitorGeoLocation, config.MONITOR_GEOLOCATION_INTERVAL)
}

function monitorWindows() {
    windowsExtractor()
}

function monitorLinux() {
    linuxExtractor()
}

function monitorOSX() {
    osxExtractor()
}

function init() {
    //monitorGeoLocation()

    if (config.IS_WINDOWS) {
        monitorWindows()
    }
    else if (config.IS_LINUX) {
        monitorLinux
    }
    else if (config.IS_OSX) {
        monitorLinux
    }
}


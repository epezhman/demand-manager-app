'use strict'

module.exports = {
    init,
    extractDevicesData,
    monitorGeoLocation,
}

const storage = require('electron-json-storage')

const config = require('../config')
const windows = require('../main/windows')
const windowsExtractor = require('./windows-device-analyzer')
const linuxExtractor = require('./linux-device-analyzer')
const osxExtractor = require('./osx-device-analyzer')

function monitorGeoLocation() {
    windows.gelocation.init()
    setTimeout(monitorGeoLocation, config.MONITOR_GEOLOCATION_INTERVAL)
}


function extractDevicesData() {

    storage.has('device-data-extracted', (error, hasKey) => {
        if (!hasKey) {
            if (config.IS_WINDOWS) {
                windowsExtractor()
            }
            else if (config.IS_LINUX) {
                linuxExtractor()
            }
            else if (config.IS_OSX) {
                osxExtractor()
            }
        }
    })
}


function init() {
    monitorGeoLocation()
    extractDevicesData()
}
'use strict'

module.exports = {
    init,
    extractDevicesData,
    monitorGeoLocation,
    monitorPower
}

const storage = require('electron-json-storage')

const config = require('../config')
const windows = require('../main/windows')


function monitorGeoLocation() {
    windows.gelocation.init()
    setTimeout(monitorGeoLocation, config.MONITOR_GEOLOCATION_INTERVAL)
}

function monitorPower() {

    if (config.IS_WINDOWS) {
        require('./windows-device-analyzer').monitorPower()
    }
    else if (config.IS_LINUX) {
        require('./linux-device-analyzer').monitorPower()
    }
    else if (config.IS_OSX) {
        require('./osx-device-analyzer').monitorPower()
    }

    setTimeout(monitorPower, config.MONITOR_POWER_INTERVAL)
}

function extractDevicesData() {
    storage.has('device-data-extracted', (error, hasKey) => {
        if (!hasKey) {
            if (config.IS_WINDOWS) {
                require('./windows-device-analyzer').deviceAnalysis()
            }
            else if (config.IS_LINUX) {
                require('./linux-device-analyzer').deviceAnalysis()
            }
            else if (config.IS_OSX) {
                require('./osx-device-analyzer').deviceAnalysis()
            }
        }
    })
}


function init() {
    monitorGeoLocation()
    extractDevicesData()
    monitorPower()
}
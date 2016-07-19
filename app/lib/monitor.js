'use strict'

module.exports = {
    init,
    monitorGeoLocation,
    monitorWindows
}

const config = require('../config')
const windows = require('../main/windows')
const windowsExtractor = require('./windows-device-analyzer')

function monitorGeoLocation() {
    windows.gelocation.init()
    setTimeout(monitorGeoLocation, config.MONITOR_GEOLOCATION_INTERVAL)
}

function monitorWindows() {
    windowsExtractor()
}

function init() {
    //monitorGeoLocation()
    monitorWindows()
}


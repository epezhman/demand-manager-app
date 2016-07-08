'use strict'

module.exports = {
    init,
    monitorGeoLocation
}

const config = require('../config')
const windows = require('../main/windows')

function monitorGeoLocation() {
    windows.gelocation.init()
    setTimeout(monitorGeoLocation, config.MONITOR_GEOLOCATION_INTERVAL)
}

function init() {
    monitorGeoLocation()
}


'use strict'

module.exports = {
    init,
    extractDevicesData,
    monitorGeoLocation,
    monitorPower,
    shouldAppBeRunning
}

const ConfigStore = require('configstore')

const config = require('../config')
const windows = require('../main/windows')
const enums = require('./enums')

const log = require('./log')
const conf = new ConfigStore(config.APP_SHORT_NAME)


function shouldAppBeRunning() {
    if (conf.get('limited-activity')) {
        var startTime = conf.get('limited-activity-start-time')
        var endTime = conf.get('limited-activity-end-time')
        startTime = startTime === undefined ? 0 : startTime
        endTime = endTime === undefined ? 24 : endTime
        var d = new Date()
        return d.getHours() >= startTime && d.getHours() < endTime
    }
    return true
}

function monitorGeoLocation() {
    if (shouldAppBeRunning()) {
        windows.gelocation.init(enums.LocationMonitor.FIND_LOCATION)
    }
    setTimeout(monitorGeoLocation, config.MONITOR_GEOLOCATION_INTERVAL)
}

function monitorPower() {
    if (shouldAppBeRunning()) {
        if (config.IS_WINDOWS) {
            require('./windows-device-analyzer').monitorPower()
        }
        else if (config.IS_LINUX) {
            require('./linux-device-analyzer').monitorPower(enums.LinuxPowerMonitor.BATTERY_FIRST_PROFILE)
        }
        else if (config.IS_OSX) {
            require('./osx-device-analyzer').monitorPower()
        }
    }
    setTimeout(monitorPower, config.MONITOR_POWER_INTERVAL)
}

function extractDevicesData() {
    windows.gelocation.init(enums.LocationMonitor.MAKE_LOCATION_PROFILE)
    if (!conf.get('device-data-extracted')) {
        if (config.IS_WINDOWS) {
            const winAnalyzer = require('./windows-device-analyzer')
            winAnalyzer.deviceAnalysis()
            winAnalyzer.batteryCapabilities()
            winAnalyzer.batteryFirstTimeProfile
        }
        else if (config.IS_LINUX) {
            const linuxAnalyzer = require('./linux-device-analyzer')
            linuxAnalyzer.deviceAnalysis()
            linuxAnalyzer.monitorPower(enums.LinuxPowerMonitor.BATTERY_FIRST_PROFILE)
        }
        else if (config.IS_OSX) {
            require('./osx-device-analyzer').deviceAnalysis()
        }
    }
}


function init() {
    monitorGeoLocation()
    monitorPower()
}
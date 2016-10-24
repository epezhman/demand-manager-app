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
            require('./linux-device-analyzer').monitorPower(enums.LinuxPowerMonitor.BATTERY)
        }
        else if (config.IS_OSX) {
            require('./osx-device-analyzer').monitorPower()
        }
    }
    setTimeout(monitorPower, config.MONITOR_POWER_INTERVAL)
}

function updateRunningProfile() {
    if (shouldAppBeRunning()) {
        windows.db.runQuery({
            'fn': 'updateRunningProfile',
            'params': []
        })
    }
    setTimeout(updateRunningProfile, config.MONITOR_RUNNING_PROFILE_INTERVAL)
}

function addRunningProfile() {
    if (shouldAppBeRunning()) {
        if (config.IS_WINDOWS) {
            log('windows running profile')
        }
        else if (config.IS_LINUX) {
            require('./linux-device-analyzer').addRunning()
        }
        else if (config.IS_OSX) {
            log('osx running profile')
        }
    }
    setTimeout(addRunningProfile, config.ADD_RUNNING_PROFILE_INTERVAL)
}

function getPowerStats() {
    if (shouldAppBeRunning()) {
        windows.db.runQuery({
            'fn': 'powerStats',
            'params': []
        })
    }
    setTimeout(getPowerStats, config.MONITOR_RUNNING_PROFILE_INTERVAL)
}

function extractDevicesData() {
    if (!conf.get('device-data-extracted')) {
        windows.gelocation.init(enums.LocationMonitor.MAKE_LOCATION_PROFILE)
        if (config.IS_WINDOWS) {
            const winAnalyzer = require('./windows-device-analyzer')
            winAnalyzer.deviceAnalysis()
            winAnalyzer.batteryCapabilities()
            winAnalyzer.batteryFirstTimeProfile()
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
    setTimeout(getPowerStats, 20000)
    setTimeout(monitorPower, 5000)
    setTimeout(addRunningProfile, 10000)
    setTimeout(updateRunningProfile, 15000)
    setTimeout(monitorGeoLocation, 1000)
}
'use strict'

module.exports = {
    init,
    extractDevicesData,
    monitorGeoLocation,
    monitorPower,
    shouldAppBeRunning,
    initDMFlags
}

const ConfigStore = require('configstore')

const config = require('../config')
const windows = require('../main/windows')
const enums = require('./enums')

const log = require('./log')
const conf = new ConfigStore(config.APP_SHORT_NAME)
const cm = require('./command-manager')
const powerControlSettings = require('../lib/power-control-settings')


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
            require('./windows-device-analyzer').addRunning()
        }
        else if (config.IS_LINUX) {
            require('./linux-device-analyzer').addRunning()
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
    setTimeout(getPowerStats, config.UPDATE_POWER_STATS_DAILY)
}

function extractDevicesData() {
    if (!conf.get('device-data-extracted')) {
        cm.makeFirstCommandsSchedule()

        powerControlSettings.init()


        setTimeout(() => {
            windows.gelocation.init(enums.LocationMonitor.MAKE_LOCATION_PROFILE)

        }, 5000)

        setTimeout(() => {
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
        }, 2000)
    }
}


function initDMFlags() {
    conf.set('dm-already-start', false)
    conf.set('dm-already-stop', false)
}

function init() {
    setTimeout(getPowerStats, 5000)
    setTimeout(monitorPower, 10000)
    setTimeout(addRunningProfile, 15000)
    setTimeout(updateRunningProfile, 20000)
    setTimeout(monitorGeoLocation, 25000)
}
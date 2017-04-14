'use strict'

module.exports = {
    init,
    extractDevicesData,
    monitorGeoLocation,
    monitorPower,
    shouldAppBeRunning,
    initDMFlags,
    calculateSavedMinutes,
    calculateSavedEnergy
}

const ConfigStore = require('configstore')

const config = require('../config')
const windows = require('../main/windows')
const enums = require('./enums')

const log = require('./log')
const conf = new ConfigStore(config.APP_SHORT_NAME)
const InitialSettings = require('./initial-settings')


function shouldAppBeRunning() {
    if (conf.get('limited-activity')) {
        let startTime = conf.get('limited-activity-start-time')
        let endTime = conf.get('limited-activity-end-time')
        startTime = startTime === undefined ? 0 : startTime
        endTime = endTime === undefined ? 24 : endTime
        let d = new Date()
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
            const winAnalyzer = require('./windows-device-analyzer')
            winAnalyzer.checkConnectivity()
            winAnalyzer.monitorPower()
        }
        else if (config.IS_LINUX) {
            require('./linux-device-analyzer').monitorPower(enums.LinuxPowerMonitor.BATTERY)
        }
    }
    setTimeout(monitorPower, conf.get('power-monitor-interval'))
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

function updateBatteryProfile() {
    if (shouldAppBeRunning()) {
        windows.db.runQuery({
            'fn': 'updateBatteryProfile',
            'params': []
        })
    }
    setTimeout(updateBatteryProfile, config.UPDATE_BATTERY_PROFILE_INTERVAL)
}

function deleteOutdatedData() {
    if (shouldAppBeRunning()) {
        windows.db.runQuery({
            'fn': 'deleteOutDatedData',
            'params': []
        })
    }
    setTimeout(deleteOutdatedData, config.DELETE_OUTDATED_DATA)
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

function extractDevicesData() {
    if (!conf.get('device-data-extracted')) {
        InitialSettings.init()
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
    }
}

function initDMFlags() {
    conf.set('dm-already-start', false)
    conf.set('dm-already-stop', false)
}

function calculateSavedMinutes() {
    if (!conf.has('saved-minutes')) {
        conf.set('saved-minutes', 0)
    }
    if (conf.has('started-running')) {
        let currentTime = new Date()
        let startTime = new Date(conf.get('started-running'))
        let minutes = Math.ceil((currentTime - startTime) / 60000)
        conf.set('saved-minutes', conf.get('saved-minutes') + minutes)
        conf.set('started-running', 0)
    }
}

function calculateSavedEnergy(powerData) {
    if (!conf.has('saved-energy-watts-second')) {
        conf.set('saved-energy-watts-second', 0)
    }
    if (conf.has('saved-energy-watts-second')) {
        let savedEnergy = (powerData['estimated_power_save_w'] - powerData['estimated_power_consume_w']) *
            (conf.get('power-monitor-interval') / 1000)
        conf.set('saved-energy-watts-second', conf.get('saved-energy-watts-second') + savedEnergy)
    }
}

function checkConf() {
    log(conf.get('power-model-url'))
    log(conf.get('schedule-period'))
    log(conf.get('logging-enabled'))
    log(conf.get('days-delete-db'))
    log(conf.get('power-monitor-interval'))
    setTimeout(checkConf, config.CHECK_CONF)
}

function init() {
    checkConf()
    initDMFlags()
    monitorPower()
    setTimeout(updateBatteryProfile, 3000)
    setTimeout(addRunningProfile, 6000)
    setTimeout(updateRunningProfile, 9000)
    setTimeout(monitorGeoLocation, 12000)
    setTimeout(deleteOutdatedData, 60000)
}
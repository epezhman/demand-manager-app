'use strict'

module.exports = {
    init,
    extractDevicesData,
    monitorGeoLocation,
    monitorPower,
    shouldAppBeRunning
}

const storage = require('electron-json-storage')

const config = require('../config')
const windows = require('../main/windows')


function shouldAppBeRunning() {
    try {
        storage.has('limited-activity', (error, hasKey)=> {
            if (!hasKey) {
                return false
            }
            else {
                var d = new Date()
                storage.get('limited-activity-start-time', (error, startTime) => {
                    var startHour = startTime.limitedStartTime
                    storage.get('limited-activity-end-time', (error, endTime) => {
                        var endHour = endTime.limitedEndTime
                        return !(startHour && endHour &&
                        (d.getHours() >= startHour && d.getHours() < endHour));
                    })
                })
            }
        })
    }
    catch (e) {
        return true
    }

}

function monitorGeoLocation() {
    if (shouldAppBeRunning()) {
        windows.gelocation.init()
    }
    setTimeout(monitorGeoLocation, config.MONITOR_GEOLOCATION_INTERVAL)
}

function monitorPower() {
    if (shouldAppBeRunning()) {
        if (config.IS_WINDOWS) {
            require('./windows-device-analyzer').monitorPower()
        }
        else if (config.IS_LINUX) {
            require('./linux-device-analyzer').monitorPower()
        }
        else if (config.IS_OSX) {
            require('./osx-device-analyzer').monitorPower()
        }
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
    extractDevicesData()
    monitorGeoLocation()
    monitorPower()
}
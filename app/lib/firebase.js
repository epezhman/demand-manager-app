'use strict'

module.exports = {
    registerDevice,
    saveOnlineLocation,
    saveLocationFirstProfile,
    updateLocationProfile,
    saveExtractedDevicesData,
    updateBatteryProfile,
    updateRunningProfile,
    enableOfflineCapabilities,
    installedVersion,
    saveBatteryCapabilities,
    saveBatteryFirstProfile,
    watchSettingsChanges,
    saveBatteryLogging,
    firebaseWatchers
}
const electron = require('electron')
const app = electron.app
const os = require('os')
const async = require('async')
const ConfigStore = require('configstore')
const firebase = require('firebase')
const config = require('../config')
const osInfo = require('./os-info')
const GeoFire = require('geofire')
const log = require('./log')
const utils = require('./utils')
const powerModelSettings = require('./power-model-settings')

const conf = new ConfigStore(config.APP_SHORT_NAME)

let firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    databaseURL: config.FIREBASE_DATABASE_URL
}

firebase.initializeApp(firebaseConfig)

function registerDevice() {
    firebase.database().ref(`device/${global.machineId}`).set({
        'registered-time': firebase.database.ServerValue.TIMESTAMP
    })
    let deviceCount = firebase.database().ref('statistics/devices-count')
    deviceCount.transaction(function (count) {
        return count + 1
    })
    firebase.database().ref(`settings/${global.machineId}`).set({
        'logging': false,
        'power-monitor-interval': 1000,
        'days-delete-db': 3
    })
    firebase.database().ref(`schedule-period/${global.machineId}`).set({
        'schedule': 'NA'
    })
    firebase.database().ref(`power-model/${global.machineId}`).set({
        'power-model': 'NA'
    })
}

function installedVersion() {
    firebase.database().ref(`device/${global.machineId}`).update({
        'current-version': config.APP_VERSION,
        'check-update-time': firebase.database.ServerValue.TIMESTAMP,
    })
}

function saveOnlineLocation(geolocation) {
    geolocation['time'] = firebase.database.ServerValue.TIMESTAMP

    firebase.database()
        .ref(`last-location/${global.machineId}/`)
        .set(utils.standardizeObject(geolocation))

    let geoFire = new GeoFire(firebase.database()
        .ref(`online`))
    geoFire.set(global.machineId, [geolocation['latitude'], geolocation['longitude']]).then(() => {
        enableOfflineCapabilities()
    })

}

function saveLocationFirstProfile(locationProfiles) {
    async.eachLimit(locationProfiles, 100, (locationProfile, cb) => {
        if (locationProfile['id']) {
            delete locationProfile['id']
        }
        locationProfile['last-updated'] = firebase.database.ServerValue.TIMESTAMP
        let profileId =
            `${utils.getDayNum(locationProfile['day_of_week'])}-
            ${locationProfile['hour_index']}-${locationProfile['minute_index']}`
        firebase.database()
            .ref(`location/${global.machineId}/${profileId}`)
            .set(utils.standardizeObject(locationProfile)).then(() => {
            cb()
        }).catch((e) => {
            log.sendError(e)
            cb()
        })

    }, (err) => {
        if (err) {
            log.sendError(err)
        }
    })
}

function updateLocationProfile(dayOfWeek, hoursOfDay, minutesOfHour, locationData) {
    let profileId = `${utils.getDayNum(dayOfWeek)}-${hoursOfDay}-${minutesOfHour}`
    firebase.database()
        .ref(`location/${global.machineId}/${profileId}`)
        .update(utils.standardizeObject({
            'last-updated': firebase.database.ServerValue.TIMESTAMP,
            'day_of_week': dayOfWeek,
            'hour_index': hoursOfDay,
            'minute_index': minutesOfHour,
            'latitude': locationData['latitude'],
            'longitude': locationData['longitude'],
            'accuracy': locationData['accuracy'],
            'is_checked': locationData['is_checked']
        }))
}

function saveExtractedDevicesData(extractedData) {

    extractedData['time'] = firebase.database.ServerValue.TIMESTAMP

    let osPrefix = ''
    if (config.IS_WINDOWS) {
        osPrefix = 'windows-extracted-devices'
    }
    else if (config.IS_LINUX) {
        osPrefix = 'linux-extracted-devices'
    }

    firebase.database()
        .ref(`hardware/${global.machineId}/${osPrefix}/`)
        .update(utils.standardizeObject(extractedData))
    firebase.database().ref(`hardware/${global.machineId}`).update({
        'os-info': osInfo()
    })
    conf.set('device-data-extracted', true)
}

function saveBatteryCapabilities(extractedData) {
    let osPrefix = ''
    if (config.IS_WINDOWS) {
        osPrefix = 'windows-battery'
    }
    else if (config.IS_LINUX) {
        osPrefix = 'linux-battery'
    }

    firebase.database()
        .ref(`hardware/${global.machineId}/${osPrefix}/`)
        .update(utils.standardizeObject(extractedData))
}

function updateRunningProfile(dayOfWeek, hoursOfDay, minutesOfHour, appRunning, computerRunning) {
    let profileId = `${utils.getDayNum(dayOfWeek)}-${hoursOfDay}-${minutesOfHour}`

    firebase.database()
        .ref(`power/${global.machineId}/${profileId}`)
        .update({
            'app_running_bool': appRunning,
            'computer_running_bool': computerRunning

        })
}

function updateBatteryProfile(dayOfWeek, hoursOfDay, minutesOfHour, powerData) {
    powerData['last-updated'] = firebase.database.ServerValue.TIMESTAMP
    powerData['day_of_week'] = dayOfWeek
    powerData['hour_index'] = hoursOfDay
    powerData['minute_index'] = minutesOfHour

    let profileId = `${utils.getDayNum(powerData['day_of_week'])}
    -${powerData['hour_index']}-${powerData['minute_index']}`

    firebase.database()
        .ref(`power/${global.machineId}/${profileId}`)
        .update(utils.standardizeObject(powerData))
}

function saveBatteryFirstProfile(batteryProfiles) {
    async.eachLimit(batteryProfiles, 100, (batteryProfile, cb) => {
        if (batteryProfile['id']) {
            delete batteryProfile['id']
        }
        batteryProfile['last-updated'] = firebase.database.ServerValue.TIMESTAMP
        let profileId =
            `${utils.getDayNum(batteryProfile['day_of_week'])}
            -${batteryProfile['hour_index']}-${batteryProfile['minute_index']}`
        firebase.database()
            .ref(`power/${global.machineId}/${profileId}`)
            .set(utils.standardizeObject(batteryProfile)).then(() => {
            cb()
        }).catch((e) => {
            log.sendError(e)
            cb()
        })

    }, (err) => {
        if (err) {
            log.sendError(err)
        }
    })
}

function enableOfflineCapabilities() {
    let onlineConnectionsRef = firebase.database()
        .ref(`online/${global.machineId}/connections`)
    let lastOnlineRef = firebase.database()
        .ref(`activity-status/${global.machineId}/last-online`)
    let connectedRef = firebase.database().ref('.info/connected')
    connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
            let con = onlineConnectionsRef.push(firebase.database.ServerValue.TIMESTAMP)
            con.onDisconnect().remove()
            lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP)
        }
    })
}

function watchSchedulePeriodChanges() {
    let scheduleRef = firebase.database().ref(`schedule-period/${global.machineId}`)
    scheduleRef.once('value', (snapshot) => {
        let schedule = snapshot.val()
        if (schedule) {
            conf.set('schedule-period', schedule['schedule'])
        }
    })
    return scheduleRef.on('child_changed', (snapshot) => {
        if (snapshot.key === 'schedule') {
            conf.set('schedule-period', snapshot.val())
        }
    })
}

function watchSettingsChanges() {
    let settingRef = firebase.database().ref(`settings/${global.machineId}`)
    settingRef.once('value', (snapshot) => {
        let settings = snapshot.val()
        if (settings) {
            conf.set('logging-enabled', settings['logging'])
            conf.set('power-monitor-interval', settings['power-monitor-interval'])
            conf.set('days-delete-db', settings['days-delete-db'])
        }
    })
    return settingRef.on('child_changed', (snapshot) => {
        if (snapshot.key === 'logging') {
            conf.set('logging-enabled', snapshot.val())
        }
        else if (snapshot.key === 'power-monitor-interval') {
            conf.set('power-monitor-interval', snapshot.val())
        }
        else if (snapshot.key === 'days-delete-db') {
            conf.set('days-delete-db', snapshot.val())
        }
    })
}

function watchPowerModelChanges() {
    let settingRef = firebase.database().ref(`power-model/${global.machineId}`)
    settingRef.once('value', (snapshot) => {
        let settings = snapshot.val()
        if (settings) {
            conf.set('power-model', settings['power-model'])
            powerModelSettings.updatePowerModelCoef()
        }
    })
    return settingRef.on('child_changed', (snapshot) => {
        if (snapshot.key === 'power-model') {
            conf.set('power-model', snapshot.val())
            powerModelSettings.updatePowerModelCoef()
        }
    })
}

function watchRestart() {
    let settingRef = firebase.database().ref(`settings/${global.machineId}`)
    settingRef.once('value', (snapshot) => {
        let settings = snapshot.val()
        if (settings) {
            if (settings['restart']) {
                updateStatusAnRestart()
            }
        }
    })
    return settingRef.on('child_added', (snapshot) => {
        if (snapshot.key === 'restart' && snapshot.val()) {
            updateStatusAnRestart()
        }
    })
}

function saveBatteryLogging(extractedData) {
    extractedData['time'] = firebase.database.ServerValue.TIMESTAMP
    firebase.database().ref(`logging/${global.machineId}`).push(utils.standardizeObject(extractedData))
}

function updateStatusAnRestart() {
    firebase.database().ref(`settings/${global.machineId}/restart`).set(null).then(() => {
        app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])})
        app.exit(0)
    })
}

function firebaseWatchers() {
    return {
        'setting-watcher': watchSettingsChanges(),
        'schedule-period-watcher': watchSchedulePeriodChanges(),
        'restart-watcher': watchRestart(),
        'power-model-watcher': watchPowerModelChanges()
    }
}

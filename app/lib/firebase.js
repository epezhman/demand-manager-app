'use strict'

module.exports = {
    registerDevice,
    saveLocation,
    saveOnlineLocation,
    saveLocationFirstProfile,
    saveExtractedDevicesData,
    saveBatteryData,
    updateRunningData,
    enableOfflineCapabilities,
    installedVersion,
    saveBatteryCapabilities,
    saveBatteryFirstProfile
}

const os = require('os')
const ConfigStore = require('configstore')
const firebase = require('firebase')
const config = require('../config')
const osInfo = require('./os-info')
const GeoFire = require('geofire')
const log = require('./log')


const conf = new ConfigStore(config.APP_SHORT_NAME)

var firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    databaseURL: config.FIREBASE_DATABASE_URL
}

firebase.initializeApp(firebaseConfig)

function registerDevice() {
    firebase.database().ref(`device/${global.machineId}`).set({
        'registered-time': firebase.database.ServerValue.TIMESTAMP
    })
    var deviceCount = firebase.database().ref('statistics/devices-count')
    deviceCount.transaction(function (count) {
        return count + 1
    })
}

function installedVersion() {
    firebase.database().ref(`device/${global.machineId}`).update({
        'current-version': config.APP_VERSION,
        'check-update-time': firebase.database.ServerValue.TIMESTAMP,
    })
}

function saveLocation(geolocation) {

    geolocation['time'] = firebase.database.ServerValue.TIMESTAMP

    firebase.database()
        .ref(`location/${global.machineId}/last-location/`)
        .set(geolocation)
}

function saveOnlineLocation(geolocation) {

    geolocation['time'] = firebase.database.ServerValue.TIMESTAMP

    firebase.database()
        .ref(`location/${global.machineId}/last-location/`)
        .set(geolocation)

    var geoFire = new GeoFire(firebase.database()
        .ref(`online`))
    geoFire.set(global.machineId, [geolocation['latitude'], geolocation['longitude']]).then(()=> {
        enableOfflineCapabilities()
    })

}

function saveLocationFirstProfile(locationProfiles) {
    for (var locationProfile of locationProfiles) {
        if (locationProfile['id']) {
            delete locationProfile['id']
        }
        locationProfile['last-updated'] = firebase.database.ServerValue.TIMESTAMP
        var profileId = `${locationProfile['day_of_week']}-${locationProfile['one_hour_duration_beginning']}`
        firebase.database()
            .ref(`location/${global.machineId}/${profileId}`)
            .set(locationProfile)
    }
}

function saveExtractedDevicesData(extractedData) {

    extractedData['time'] = firebase.database.ServerValue.TIMESTAMP

    var osPrefix = ''
    if (config.IS_WINDOWS) {
        osPrefix = 'windows-extracted-devices'
    }
    else if (config.IS_LINUX) {
        osPrefix = 'linux-extracted-devices'
    }
    else if (config.IS_OSX) {
        osPrefix = 'osx-extracted-devices'
    }

    firebase.database()
        .ref(`hardware/${global.machineId}/${osPrefix}/`)
        .update(extractedData)
    firebase.database().ref(`hardware/${global.machineId}`).update({
        'os-info': osInfo()
    })
    conf.set('device-data-extracted', true)
}

function saveBatteryCapabilities(extractedData) {
    var osPrefix = ''
    if (config.IS_WINDOWS) {
        osPrefix = 'windows-battery'
    }
    else if (config.IS_LINUX) {
        osPrefix = 'linux-battery'
    }
    else if (config.IS_OSX) {
        osPrefix = 'osx-battery'
    }

    firebase.database()
        .ref(`hardware/${global.machineId}/${osPrefix}/`)
        .update(extractedData)
}

function updateRunningData(dayOfWeek, hoursOfDay, appRunning, computerRunning) {
    var profileId = `${dayOfWeek}-${hoursOfDay}`

    firebase.database()
        .ref(`power/${global.machineId}/${profileId}`)
        .update({
            'app_running_bool': appRunning,
            'computer_running_bool': computerRunning

        })
}

function saveBatteryData(powerData, dayOfWeek, hoursOfDay) {
    powerData['last-updated'] = firebase.database.ServerValue.TIMESTAMP
    powerData['day_of_week'] = dayOfWeek
    powerData['one_hour_duration_beginning'] = hoursOfDay

    var profileId = `${powerData['day_of_week']}-${powerData['one_hour_duration_beginning']}`

    firebase.database()
        .ref(`power/${global.machineId}/${profileId}`)
        .update(powerData)
}

function saveBatteryFirstProfile(batteryProfiles) {
    for (var batteryProfile of batteryProfiles) {
        if (batteryProfile['id']) {
            delete batteryProfile['id']
        }
        batteryProfile['last-updated'] = firebase.database.ServerValue.TIMESTAMP
        var profileId = `${batteryProfile['day_of_week']}-${batteryProfile['one_hour_duration_beginning']}`

        firebase.database()
            .ref(`power/${global.machineId}/${profileId}`)
            .update(batteryProfile)
    }
}

function enableOfflineCapabilities() {
    var onlineConnectionsRef = firebase.database()
        .ref(`online/${global.machineId}/connections`)
    var lastOnlineRef = firebase.database()
        .ref(`activity-status/${global.machineId}/last-online`)
    var connectedRef = firebase.database().ref('.info/connected')
    connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
            var con = onlineConnectionsRef.push(firebase.database.ServerValue.TIMESTAMP)
            con.onDisconnect().remove()
            lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP)
        }
    })
}

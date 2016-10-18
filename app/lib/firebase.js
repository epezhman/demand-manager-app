'use strict'

module.exports = {
    registerDevice,
    saveLocation,
    saveExtractedDevicesData,
    saveBatteryData,
    enableOfflineCapabilities,
    installedVersion,
    saveBatteryCapabilities,
    saveBatteryFirstPlan
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
    firebase.database().ref(`devices/${global.machineId}`).set({
        'registered-time': firebase.database.ServerValue.TIMESTAMP
    })
    var deviceCount = firebase.database().ref('statistics/devices-count')
    deviceCount.transaction(function (count) {
        return count + 1
    })
}

function installedVersion() {
    firebase.database().ref(`devices/${global.machineId}`).update({
        'current-version': config.APP_VERSION,
        'check-update-time': firebase.database.ServerValue.TIMESTAMP,
    })
}

function saveLocation(geolocation) {

    geolocation['time'] = firebase.database.ServerValue.TIMESTAMP

    firebase.database()
        .ref(`locations/${global.machineId}/last-location/`)
        .set(geolocation)

    firebase.database()
        .ref(`locations/${global.machineId}/locations/`)
        .push(geolocation)


    var geoFire = new GeoFire(firebase.database()
        .ref(`online`))
    geoFire.set(global.machineId, [geolocation['latitude'], geolocation['longitude']]).then(()=> {
        enableOfflineCapabilities()
    })

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

function saveBatteryData(powerData) {
    powerData['time'] = firebase.database.ServerValue.TIMESTAMP
    if (powerData['id']) {
        delete powerData['id']
    }

    firebase.database()
        .ref(`battery/${global.machineId}/`)
        .push(powerData)
}

function saveBatteryFirstPlan(batteryPlans) {
    log(batteryPlans)
    for (var batteryPlan of batteryPlans) {
        if (batteryPlan['id']) {
            delete batteryPlan['id']
        }
        batteryPlan['last-updated'] = firebase.database.ServerValue.TIMESTAMP
        log(`battery/${global.machineId}/
                            ${batteryPlan['day_of_week']}-${batteryPlan['one_hour_duration_beginning']}`)
        firebase.database().ref(`battery/${global.machineId}/
                            ${batteryPlan['day_of_week']}-${batteryPlan['one_hour_duration_beginning']}`).set(batteryPlan)
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

'use strict'

module.exports = {
    registerDevice,
    saveLocation,
    saveExtractedDevicesData,
    saveBatteryData,
    enableOfflineCapabilities,
    installedVersion
}

const os = require('os')
const ConfigStore = require('configstore')
const firebase = require('firebase')
const config = require('../config')
const osInfo = require('./os-info')

const conf = new ConfigStore(config.APP_SHORT_NAME)

var firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    databaseURL: config.FIREBASE_DATABASE_URL
}

firebase.initializeApp(firebaseConfig)

function registerDevice() {
    firebase.database().ref(`devices/${global.machineId}`).set({
        'registered-time': firebase.database.ServerValue.TIMESTAMP,
        'os-info': osInfo()
    })
}

function installedVersion() {
    firebase.database().ref(`devices/${global.machineId}`).update({
        'current-version': config.APP_VERSION
    })
}

function saveLocation(geolocation) {

    geolocation['time'] = firebase.database.ServerValue.TIMESTAMP

    firebase.database()
        .ref(`devices/${global.machineId}/last-location/`)
        .set({
            'time': geolocation['time'],
            'latitude': geolocation['latitude'],
            'longitude': geolocation['longitude']
        })

    firebase.database()
        .ref(`devices/${global.machineId}/locations/`)
        .push(geolocation)
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
        .ref(`devices/${global.machineId}/${osPrefix}/`)
        .set(extractedData)

    conf.set('device-data-extracted', true)
}


function saveBatteryData(powerData) {

    powerData['time'] = firebase.database.ServerValue.TIMESTAMP

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
        .ref(`devices/${global.machineId}/${osPrefix}/`)
        .push(powerData)
}

function enableOfflineCapabilities() {

    var onlineConnectionsRef = firebase.database()
        .ref(`devices/${global.machineId}/connections`)
    var lastOnlineRef = firebase.database()
        .ref(`devices/${global.machineId}/last-online`)
    var connectedRef = firebase.database().ref('.info/connected')
    connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
            var con = onlineConnectionsRef.push(firebase.database.ServerValue.TIMESTAMP)
            con.onDisconnect().remove()
            lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP)
        }
    })
}

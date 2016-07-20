'use strict'

module.exports = {
    registerDevice,
    saveLocation,
    saveExtractedDevicesData
}


const os = require('os')
const storage = require('electron-json-storage')
const firebase = require('firebase')
const config = require('../config')
const osInfo = require('./os-info')

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


function saveLocation(geolocation) {

    geolocation['time'] = firebase.database.ServerValue.TIMESTAMP

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
        .push(extractedData)

    // storage.set('device-data-extracted', {is_done: true}, (error)=> {
    // })
}

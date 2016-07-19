'use strict'

module.exports = {
    registerDevice,
    saveLocation,
    saveWindowsDevicesData
}

const os = require('os')
const firebase = require('firebase')
const config = require('../config')
const osInfo = require('./os-info')

var firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    databaseURL: config.FIREBASE_DATABASE_URL
}

firebase.initializeApp(firebaseConfig)

function registerDevice() {
    firebase.database().ref(`devices/${global.machineId}`).set(osInfo())
}


function saveLocation(geolocation) {

    geolocation['time'] = firebase.database.ServerValue.TIMESTAMP

    firebase.database()
        .ref(`devices/${global.machineId}/locations/`)
        .push(geolocation)
}


function saveWindowsDevicesData(extractedData) {

    extractedData['time'] = firebase.database.ServerValue.TIMESTAMP

    firebase.database()
        .ref(`devices/${global.machineId}/windows-extracted-data/`)
        .push(extractedData)
}

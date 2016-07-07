'use strict'

module.exports = {
    registerDevice
}

const os = require('os')
const firebase = require('firebase')
const config = require('../config')
const log = require('./log')

var firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    databaseURL: config.FIREBASE_DATABASE_URL
}

firebase.initializeApp(firebaseConfig)

function registerDevice() {
    firebase.database().ref('devices/' + global.machineId).set({
        'os-platform': os.platform(),
        'os-release':os.release(),
        'os-arch': os.arch(),
        'os-cpus': os.cpus(),
        'os-loadavg': os.loadavg(),
        'os-network-interfaces': os.networkInterfaces(),
        'os-totalmem': os.totalmem()
    })
}

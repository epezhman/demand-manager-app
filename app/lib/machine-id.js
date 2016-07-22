'use strict'

module.exports = {
    init
}

const ConfigStore = require('configstore')
const config = require('../config')
const firebase = require('./firebase')

const conf = new ConfigStore(config.APP_SHORT_NAME)

function init() {
    if (conf.get('machine-uuid')) {
        global.machineId = conf.get('machine-uuid')
    }
    else {
        global.machineId = require('node-uuid').v1()
        conf.set('machine-uuid', global.machineId)
        firebase.registerDevice(global.machineId)
    }
}

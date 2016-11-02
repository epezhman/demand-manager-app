'use strict'

module.exports = {
    startDM,
    stopDM
}

const log = require('./log')
var exec = require('child_process').exec
const ConfigStore = require('configstore')
const config = require('../config')

const conf = new ConfigStore(config.APP_SHORT_NAME)


function startDM() {
    conf.set('dm-already-stop', false)
    if (!conf.get('dm-already-start')) {
        exec('powercfg.exe -getactivescheme').stdout.on('data', function (data) {
            if (data.indexOf('GUID') > -1) {
                exec('powercfg.exe -setactive 381b4222-f694-41f0-9685-ff5bb260df2e')
                conf.set('dm-already-start', true)
            }
        })
    }
}

function stopDM() {
    conf.set('dm-already-start', false)
    if (!conf.get('dm-already-stop')) {
        exec('powercfg.exe -getactivescheme').stdout.on('data', function (data) {
            if (data.indexOf('GUID') > -1) {
                exec('powercfg.exe -setactive a1841308-3541-4fab-bc81-f71556f20b4a')
                conf.set('dm-already-stop', true)
            }
        })
    }
}
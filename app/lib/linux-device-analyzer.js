'use strict'

module.exports = getLinuxDeviceAnalysis

const exec = require('child_process').exec


const async = require('async')
const _ = require('lodash')
const sudo = require('sudo-prompt')

const config = require('../config')
const log = require('./log')
const firebase = require('./firebase')
const utils = require('./utils')


var linuxDeviceData = {}


function getLshwCommandData(cb) {
    exec('lshw -version', (lshwErr, lshwStdout, lshwStderr) => {
        if (lshwErr) {
            log.error(lshwErr)
            return cb(null, true)
        }
        if (lshwStdout.includes('command not found')) {
            return cb(null, true)
        }
        sudo.exec('lshw -json', {name: config.APP_NAME}, (lshwJsonErr, lshwJsonStdout, lshwJsonStderr) => {
            if (lshwJsonErr) {
                log.error(lshwJsonErr)
                return cb(null, true)
            }
            linuxDeviceData = utils.standardizeForFirebase(lshwJsonStdout)
            cb(null, false)
        })
    })

}

function getDmidecodeCommandData(performThisMethod, cb) {
    if (performThisMethod) {
        exec('dmidecode --version', (dmiCheckErr, dmiCheckStdout, dmiCheckStderr) => {
            if (dmiCheckErr) {
                log.error(dmiCheckErr)
                return cb(null, true)
            }
            if (dmiCheckStdout.includes('command not found')) {
                return cb(null, true)
            }
            sudo.exec('dmidecode', {name: config.APP_NAME}, (dmiErr, dmiStdout, dmiStderr) => {
                if (dmiErr) {
                    log.error(dmiErr)
                    return cb(null, true)
                }
                linuxDeviceData['dmidecode'] = dmiStdout
                cb(null, false)
            })
        })
    }
    else {
        cb(null, false)
    }

}


function getCommandsSetData(performThisMethod, cb) {
    var commands = [
        'lspci',
        'lscpu',
        'lsusb',
        'cat /sys/devices/virtual/dmi/id/board_vendor && ' +
        'cat /sys/devices/virtual/dmi/id/board_name  && ' +
        'cat /sys/devices/virtual/dmi/id/board_version',
        'free -m | grep "Mem:"',
        'upower -i /org/freedesktop/UPower/devices/battery_BAT0'
    ]
    async.eachSeries(commands, (command, commmandCb)=> {
        exec(command, (commandErr, commandStdout, commmandStderr) => {
            if (commandErr) {
                log.error(commandErr)
                return commmandCb()
            }
            linuxDeviceData[_.split(command, ' ')[0]] = _.split(_.trim(commandStdout), '\n')
            commmandCb()
        })
    }, (err)=> {
        if (err) {
            log.error(err)
        }
        cb(null, false)
    })
}

function sendExtractedData(err, result) {
    if (err) {
        log.error(err)
    }

    log(linuxDeviceData)
    if (linuxDeviceData && _.size(linuxDeviceData))
        firebase.saveExtractedDevicesData(linuxDeviceData)

}

function getLinuxDeviceAnalysis() {

    async.waterfall([
        getLshwCommandData,
        getDmidecodeCommandData,
        getCommandsSetData
    ], sendExtractedData)

}
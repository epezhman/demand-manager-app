'use strict'


module.exports = {
    deviceAnalysis,
    monitorPower
}

const exec = require('child_process').exec


const async = require('async')
const _ = require('lodash')
const sudo = require('sudo-prompt')

const config = require('../config')
const log = require('./log')
const firebase = require('./firebase')
const utils = require('./utils')
const notify = require('./notify')


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
        notify('We need to collect some data about the your hardware with a SUDO command. ' +
            'Your password will not be saved')
        sudo.exec('lshw -json', {name: config.APP_NAME}, (lshwJsonErr, lshwJsonStdout, lshwJsonStderr) => {
            if (lshwJsonErr) {
                log.error(lshwJsonErr)
                return cb(null, true)
            }
            linuxDeviceData['lshw'] = utils.standardizeForFirebase(lshwJsonStdout)
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
            notify('We need to collect some data about the your hardware with a SUDO command. ' +
                'Your password will not be saved')
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
    async.eachSeries(commands, (command, commandCb)=> {
        exec(command, (commandErr, commandStdout, commandStderr) => {
            if (commandErr) {
                log.error(commandErr)
                return commandCb()
            }
            if (commandStdout.includes('command not found') ||
                commandStdout.includes('No such file or directory')) {
                return commandCb()
            }
            linuxDeviceData[_.split(command, ' ')[0]] = utils.tryConvertToJson(commandStdout)
            commandCb()
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

    if (linuxDeviceData && _.size(linuxDeviceData)) {
        firebase.saveExtractedDevicesData(linuxDeviceData)
    }

}

function deviceAnalysis() {

    async.waterfall([
        getLshwCommandData,
        getDmidecodeCommandData,
        getCommandsSetData
    ], sendExtractedData)

}


function monitorPower() {
    var powerData = {}
    var commands = {
        power1: 'cat /sys/class/power_supply/BAT0/power_now',
        power2: 'cat /sys/bus/acpi/drivers/battery/PNP0C0A:00/power_supply/BAT0/power_now',
        power3: 'cat /sys/class/powercap/*/energy_uj',
        battery1: 'upower -i /org/freedesktop/UPower/devices/battery_BAT0',
        battery2: 'acpi -ib',
        battery3: 'acpi',
        battery4: ' acpi -V',
        batteryCapacity: 'cat /sys/class/power_supply/BAT0/capacity'
    }
    async.eachOfSeries(commands, (commandValue, commandKey, commandCb)=> {
        exec(commandValue, (commandErr, commandStdout, commandStderr) => {
            if (commandErr) {
                log.error(commandErr)
                return commandCb()
            }
            if (commandStdout.includes('command not found') ||
                commandStdout.includes('No such file or directory')) {
                return commandCb()
            }
            powerData[_.kebabCase(commandKey)] = utils.tryConvertToJson(commandStdout)
            commandCb()
        })
    }, (err)=> {
        if (err) {
            log.error(err)
        }
        firebase.saveBatteryData(powerData)
    })
}
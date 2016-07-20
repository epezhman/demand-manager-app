'use strict'

module.exports = getLinuxDeviceAnalysis

const exec = require('child_process').exec


const async = require('async')
const _ = require('lodash/collection')
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
        exec('dmidecode --version', (err, stdout, stderr) => {
            if (err) {
                log.error(err)
                return cb(null, true)
            }
            if (stdout.includes('command not found')) {
                return cb(null, true)
            }
            log('dmidecode')
            cb(null, false)
        })
    }
    else {
        cb(null, false)
    }

}


function getCommandsSetData(performThisMethod, cb) {
    if (performThisMethod) {
        log('other')
        cb(null, false)
    }
    else {
        cb(null, false)
    }

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
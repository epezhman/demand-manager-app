'use strict'

module.exports = getWindowsDeviceAnalysis

const config = require('../config')
const log = require('./log')
const utils = require('./utils')
const wmicParams = require('./wmic-params')
const firebase = require('./firebase')

const wmic = require('ms-wmic')
const _ = require('lodash/string')
const async = require('async')

var windowsDeviceData = {}

function runWMIC(wmiClass, command, paramCallback) {
    try {
        wmic.execute(`path ${wmiClass} get ${command}`, (err, stdOut) => {
            if (err) {
                log.error(err)
                return paramCallback()
            }
            windowsDeviceData[_.trimStart(_.toLower(`${wmiClass}-${command}`), 'win32_')] =
                utils.convertWmicStringToList(stdOut)
            paramCallback()
        })
    }
    catch (err) {
        log.error(err)
        paramCallback()
    }
}

function getWindowsDeviceAnalysis() {

    async.eachOfLimit(wmicParams, 2, (wmiClassProps, wmiClass, commandCallback) => {
        async.eachLimit(wmiClassProps, 3, (wmiClassProp, paramCallback) => {
            runWMIC(wmiClass, wmiClassProp, paramCallback)
        }, (err) => {
            if (err) {
                log.error(err.message)
            }
            commandCallback()
        })
    }, (err) => {
        if (err) {
            log.error(err.message)
        }
        firebase.saveWindowsDevicesData(windowsDeviceData)
        log(windowsDeviceData)
    })
}
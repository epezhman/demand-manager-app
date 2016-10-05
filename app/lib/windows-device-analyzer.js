'use strict'


module.exports = {
    deviceAnalysis,
    monitorPower,
    batteryCapabilities
}

const config = require('../config')
const log = require('./log')
const utils = require('./utils')
const wmicParams = require('./wmic-params')
const firebase = require('./firebase')
const enums = require('./enums')
const db = require('../main/windows').db

const wmic = require('ms-wmic')
const _ = require('lodash/string')
const async = require('async')

var windowsDeviceData = {}
var batteryData = {}
var batteryCapabilitiesData = {}

function runWMIC(wmicCommand, paramCallback) {
    try {
        wmic.execute(`/namespace:${wmicCommand.nameSpace} 
        path ${wmicCommand.wmiClass} get ${wmicCommand.command}`, (err, stdOut) => {
            if (err) {
                log.error(err)
                return paramCallback()
            }
            if (wmicCommand.commandType === enums.WMICommandType.DEVICE) {
                windowsDeviceData[_.trimStart(_.toLower(`${wmicCommand.wmiClass}-${wmicCommand.command}`), 'win32_')] =
                    utils.convertWmicStringToList(stdOut)
            }
            else if (wmicCommand.commandType === enums.WMICommandType.BATTERY) {
                batteryData[_.toLower(`${wmicCommand.wmiClass}-${wmicCommand.command}`)] =
                    utils.convertWmicStringToList(stdOut)
            }
            else if (wmicCommand.commandType === enums.WMICommandType.BATTERY_CAPABILITY) {
                batteryCapabilitiesData[_.toLower(`${wmicCommand.wmiClass}-${wmicCommand.command}`)] =
                    utils.convertWmicStringToList(stdOut)
            }

            paramCallback()
        })
    }
    catch (err) {
        log.error(err)
        paramCallback()
    }
}

function runAsyncCommands(wmicCommands) {
    async.eachOfLimit(wmicCommands.commands, 2, (wmiClassProps, wmiClass, commandCallback) => {
        async.eachLimit(wmiClassProps, 3, (wmiClassProp, paramCallback) => {
            var command = {
                wmiClass: wmiClass,
                command: wmiClassProp,
                nameSpace: wmicCommands.nameSpace,
                commandType: wmicCommands.commandType
            }
            runWMIC(command, paramCallback)
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
        if (wmicCommands.commandType === enums.WMICommandType.DEVICE) {
            firebase.saveExtractedDevicesData(windowsDeviceData)
        }
        else if (wmicCommands.commandType === enums.WMICommandType.BATTERY) {
            db.runQuery({
                'fn': 'addBatteryWindows',
                'params': batteryData
            })
        }
        else if (wmicCommands.commandType === enums.WMICommandType.BATTERY_CAPABILITY) {
            firebase.saveBatteryCapabilities(batteryCapabilitiesData)
        }

    })
}

function deviceAnalysis() {
    var wmicCommands = {
        commands: wmicParams.DeviceDataExtraction,
        nameSpace: '\\\\root\\CIMV2',
        commandType: enums.WMICommandType.DEVICE,
    }
    runAsyncCommands(wmicCommands)

}

function batteryCapabilities() {
    var wmicCommands = {
        commands: wmicParams.BatteryCapabilitiesInfo,
        nameSpace: '\\\\root\\WMI',
        commandType: enums.WMICommandType.BATTERY_CAPABILITY,
    }
    runAsyncCommands(wmicCommands)
}

function monitorPower() {
    batteryData = {}
    var wmicCommands = {
        commands: wmicParams.BatteryInfoMonitor,
        nameSpace: '\\\\root\\WMI',
        commandType: enums.WMICommandType.BATTERY,
    }
    runAsyncCommands(wmicCommands)
}
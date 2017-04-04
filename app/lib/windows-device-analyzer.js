'use strict'


module.exports = {
    deviceAnalysis,
    monitorPower,
    batteryCapabilities,
    batteryFirstTimeProfile,
    addRunning,
    checkConnectivity
}

const config = require('../config')
const log = require('./log')
const utils = require('./utils')
const wmicParams = require('./wmic-params')
const firebase = require('./firebase')
const enums = require('./enums')
const db = require('../main/windows').db
const powerModel = require('./power-model')
const isOnline = require('is-online')

const wmic = require('ms-wmic')
const _ = require('lodash/string')
const __ = require('lodash/array')
const async = require('async')
const moment = require('moment')
const ConfigStore = require('configstore')
const conf = new ConfigStore(config.APP_SHORT_NAME)

let windowsDeviceData = {}
let batteryData = {}
let batteryCapabilitiesData = {}
let isComputerOnline = false

function checkConnectivity() {
    isOnline().then(online => {
        isComputerOnline = !!online;
    })
}

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
            else if (wmicCommand.commandType === enums.WMICommandType.BATTERY ||
                wmicCommand.commandType === enums.WMICommandType.BATTERY_FIRST_PROFILE) {
                if (wmicCommand.wmiClass === 'Win32_NetworkAdapter') {
                    batteryData[_.toLower(`${wmicCommand.wmiClass}-${wmicCommand.command}`)] =
                        utils.convertWmicStringWithSpaceToList(stdOut)
                }
                else {
                    batteryData[_.toLower(`${wmicCommand.wmiClass}-${wmicCommand.command}`)] =
                        utils.convertWmicStringToList(stdOut)
                }
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
            let nameSpaceRoot = '\\\\root\\'
            let wmiClassParts = wmiClass.split('$')
            let command = {
                wmiClass: wmiClassParts[1],
                command: wmiClassProp,
                nameSpace: nameSpaceRoot + wmiClassParts[0],
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
        else if (wmicCommands.commandType === enums.WMICommandType.BATTERY ||
            wmicCommands.commandType === enums.WMICommandType.BATTERY_FIRST_PROFILE) {
            let chargeRate = Math.round((parseInt(batteryData['batterystatus-chargerate']) / 1000) * 100) / 100
            let dischargeRate = Math.round((parseInt(batteryData['batterystatus-dischargerate']) / 1000) * 100) / 100
            let remainingTime = parseInt(batteryData['win32_battery-estimatedruntime'])
            let downloadRate = __.remove(batteryData['win32_perfformatteddata_tcpip_' +
                'networkinterface-bytesreceivedpersec'],
                (n) => n !== '0')
            let uploadRate = __.remove(batteryData['win32_perfformatteddata_tcpip_networkinterface-bytessentpersec'],
                (n) => n !== '0')
            let cpuUsage = batteryData['win32_perfformatteddata_perfos_processor-percentprocessortime'] ?
                Math.round((batteryData['win32_perfformatteddata_perfos_processor-percentprocessortime']
                        .map((x) => parseInt(x))).reduce((a, b) => a + b, 0) /
                    batteryData['win32_perfformatteddata_perfos_processor-percentprocessortime'].length) : 0
            let readRate = batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskreadbytespersec'] ?
                Math.round((batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskreadbytespersec']
                        .map((x) => parseInt(x))).reduce((a, b) => a + b, 0) /
                    batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskreadbytespersec'].length) : 0
            let readRequest = batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskreadspersec'] ?
                Math.round((batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskreadspersec']
                        .map((x) => parseInt(x))).reduce((a, b) => a + b, 0) /
                    batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskreadspersec'].length) : 0
            let writeRate = batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskwritebytespersece'] ?
                Math.round((batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskwritebytespersec']
                        .map((x) => parseInt(x))).reduce((a, b) => a + b, 0) /
                    batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskwritebytespersec'].length) : 0
            let writeRequest = batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskwritespersec'] ?
                Math.round((batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskwritespersec']
                        .map((x) => parseInt(x))).reduce((a, b) => a + b, 0) /
                    batteryData['win32_perfformatteddata_perfdisk_physicaldisk-diskwritespersec'].length) : 0
            let indexOfWLAN = batteryData['win32_networkadapter-netconnectionid'] ?
                batteryData['win32_networkadapter-netconnectionid'].indexOf('WLAN') : -1
            let wifiEnabled = indexOfWLAN > -1 ?
                !!batteryData['win32_networkadapter-netconnectionstatus'] &&
                !!batteryData['win32_networkadapter-netconnectionstatus'][indexOfWLAN] &&
                batteryData['win32_networkadapter-netconnectionstatus'][indexOfWLAN] === '2' : false
            let batteryObject = {
                'remaining_time_minutes': remainingTime,
                'power_rate_w': dischargeRate > 0 ? dischargeRate : chargeRate,
                'remaining_capacity_percent': parseInt(batteryData['win32_battery-estimatedchargeremaining']),
                'voltage_v': Math.round((parseInt(batteryData['batterystatus-voltage']) / 1000) * 100) / 100,
                'charging_bool': batteryData['batterystatus-charging'] ?
                    batteryData['batterystatus-charging'].toLowerCase() === 'true' : 'NaN',
                'discharging_bool': batteryData['batterystatus-discharging'] ?
                    batteryData['batterystatus-discharging'].toLowerCase() === 'true' : 'NaN',
                'ac_connected_bool': batteryData['batterystatus-poweronline'] ?
                    batteryData['batterystatus-poweronline'].toLowerCase() === 'true' : 'NaN',
                'brightness_percent': parseInt(batteryData['wmimonitorbrightness-currentbrightness']),
                'memory_percent': Math.round(((parseInt(batteryData['win32_operatingsystem-totalvisiblememorysize']) -
                    parseInt(batteryData['win32_operatingsystem-freephysicalmemory'])) * 100) /
                    parseInt(batteryData['win32_operatingsystem-totalvisiblememorysize'])),
                'memory_mb': Math.round((parseInt(batteryData['win32_operatingsystem-totalvisiblememorysize']) -
                    parseInt(batteryData['win32_operatingsystem-freephysicalmemory'])) / 1000),
                'read_request_per_s': readRequest,
                'read_kb_per_s': Math.round(readRate / 1024),
                'write_request_per_s': writeRequest,
                'write_kb_per_s': Math.round(writeRate / 1024),
                'cpu_usage_percent': cpuUsage,
                'cpu_cores': batteryData['win32_perfformatteddata_perfos_processor-percentprocessortime'] ?
                    batteryData['win32_perfformatteddata_perfos_processor-percentprocessortime'].length - 1 : 'NaN',
                'download_kb': downloadRate.length ? Math.round(parseInt(downloadRate[0]) / 1024) : 0,
                'upload_kb': uploadRate.length ? Math.round(parseInt(uploadRate[0]) / 1024) : 0,
                'wifi': wifiEnabled,
                'internet_connected': isComputerOnline,
                'dm_enabled': !!conf.get('dm-already-start')
            }
            batteryObject = utils.standardizeNumberObject(batteryObject)
            if (wmicCommands.commandType === enums.LinuxPowerMonitor.BATTERY) {
                if (conf.get('logging-enabled')) {
                    firebase.saveBatteryLogging(batteryObject)
                }
                db.runQuery({
                    'fn': 'addBattery',
                    'params': {
                        'ac_connected_bool': batteryObject['ac_connected_bool'],
                        'estimated_power_save_w': powerModel.powerNormalEstimate(batteryObject),
                        'estimated_power_consume_w': powerModel.powerSaveEstimate(batteryObject)
                    }
                })
            }
            else if (wmicCommands.commandType === enums.LinuxPowerMonitor.BATTERY_FIRST_PROFILE) {
                db.runQuery({
                    'fn': 'addBatteryFirstProfile',
                    'params': {
                        'estimated_power_save_w': powerModel.powerNormalEstimate(batteryObject),
                        'estimated_power_consume_w': powerModel.powerSaveEstimate(batteryObject)
                    }
                })
            }
        }
        else if (wmicCommands.commandType === enums.WMICommandType.BATTERY_CAPABILITY) {
            firebase.saveBatteryCapabilities(batteryCapabilitiesData)
        }
    })
}

function deviceAnalysis() {
    let wmicCommands = {
        commands: wmicParams.DeviceDataExtraction,
        commandType: enums.WMICommandType.DEVICE,
    }
    runAsyncCommands(wmicCommands)
}

function batteryCapabilities() {
    let wmicCommands = {
        commands: wmicParams.BatteryCapabilitiesInfo,
        commandType: enums.WMICommandType.BATTERY_CAPABILITY,
    }
    runAsyncCommands(wmicCommands)
}

function monitorPower() {
    batteryData = {}
    let wmicCommands = {
        commands: wmicParams.BatteryInfoMonitor,
        commandType: enums.WMICommandType.BATTERY,
    }
    runAsyncCommands(wmicCommands)
}

function batteryFirstTimeProfile() {
    batteryData = {}
    let wmicCommands = {
        commands: wmicParams.BatteryInfoMonitor,
        commandType: enums.WMICommandType.BATTERY_FIRST_PROFILE,
    }
    runAsyncCommands(wmicCommands)
}

function addRunning() {
    db.runQuery({
        'fn': 'addRunning',
        'params': []
    })
}
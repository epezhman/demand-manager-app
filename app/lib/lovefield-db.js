'use strict'

module.exports = {
    genericCaller
}

const config = require('../config')
const {remote} = require('electron')
const log = require('./log')
const makeTables = require('./lovefield-tables')
const firebase = remote.require('./lib/firebase')
const utils = require('./utils')
const lf = require('lovefield')
const Q = require('q')

var db = null

var schemaBuilder = lf.schema.create(config.LOVEFIELD_DB_NAME,
    config.LOVEFIELD_DB_VERSION)

makeTables(schemaBuilder)

function getDB() {
    if (db !== null) {
        return db
    }
    else {
        return schemaBuilder.connect().then((_db)=> {
            db = _db
        })
    }
}

function genericCaller(op, cb) {
    return operations[op.fn](op.params).then(()=> {
        cb()
    }).catch((e) => {
        log.error(e)
    })
}

function addBattery(batteryObject) {
    var battery = db.getSchema().table('Battery')
    var row = battery.createRow(batteryObject)
    return db.insert().into(battery).values([row]).exec().then(()=> {
        firebase.saveBatteryData(batteryObject)
    })
}

var operations = {
    addBatteryWindows: function (params) {
        return Q.fcall(getDB).then(()=> {
            var discharge_rate = Math.round((parseInt(params['batterystatus-chargerate']) / 1000) * 100) / 100
            var charge_rate = Math.round((parseInt(params['batterystatus-dischargerate']) / 1000) * 100) / 100
            var batteryObject = {
                'remaining_time_minutes': parseInt(params['win32_battery-estimatedruntime']),
                'power_rate_w': discharge_rate > 0 ? discharge_rate : charge_rate,
                'remaining_capacity_percent':parseInt(params['win32_battery-estimatedchargeremaining']),
                'voltage_v': Math.round((parseInt(params['batterystatus-voltage']) / 1000) * 100) / 100,
                'charging_bool': params['batterystatus-charging'].toLowerCase() === "true",
                'discharging_bool': params['batterystatus-discharging'].toLowerCase() === "true",
                'ac_connected_bool': params['batterystatus-poweronline'].toLowerCase() === "true",
                'time': new Date()
            }
            return addBattery(batteryObject)
        })
    },
    addBatteryLinux: function (params) {
        return Q.fcall(getDB).then(()=> {
            var batteryObject = {
                'remaining_time_minutes': utils.hoursToMinutes(Math.round((parseInt(params['energynow'])
                        / parseInt(params['powernow'])) * 100) / 100),
                'power_rate_w': parseInt(params['powernow'] / 1000000),
                'remaining_capacity_percent': parseInt(params['capacity']),
                'voltage_v': parseInt(params['voltage-now'] / 1000000),
                'charging_bool': params['status'] === 'Charging',
                'discharging_bool': params['status'] === 'Discharging',
                'ac_connected_bool': params['ac-connected'] === '1',
                'time': new Date()
            }
            return addBattery(batteryObject)
        })
    }
}

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
const enums = require('./enums')
const lf = require('lovefield')
const Q = require('q')
const async = require('async')

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


var operations = {
    addBattery: function (batteryObject) {
        return Q.fcall(getDB).then(()=> {
            batteryObject['time'] = new Date()
            var battery = db.getSchema().table('Battery')
            var row = battery.createRow(batteryObject)
            return db.insert().into(battery).values([row]).exec().then(()=> {
                firebase.saveBatteryData(batteryObject)
            })
        })
    },
    addBatteryFirstPlan: function (batteryObject) {
        return Q.fcall(getDB).then(()=> {

            firebase.saveBatteryFirstPlan([])

            // var batteryPlan = db.getSchema().table('BatteryPlan')
            // return db.delete().from(batteryPlan).exec().then(()=> {
            //     var rows = []
            //     for (var day_name in enums.WeekDays) {
            //         for (var hour_name in enums.DayHours) {
            //             rows.push(batteryPlan.createRow({
            //                 'remaining_time_minutes': batteryObject['remaining_time_minutes'],
            //                 'power_rate_w': batteryObject['power_rate_w'],
            //                 'remaining_capacity_percent': batteryObject['remaining_capacity_percent'],
            //                 'voltage_v': batteryObject['voltage_v'],
            //                 'charging_bool': batteryObject['charging_bool'],
            //                 'discharging_bool': batteryObject['discharging_bool'],
            //                 'ac_connected_bool': batteryObject['ac_connected_bool'],
            //                 'day_of_week': enums.WeekDays[day_name],
            //                 'one_hour_duration_beginning': enums.DayHours[hour_name],
            //             }))
            //         }
            //     }
            //     return db.insertOrReplace().into(batteryPlan).values(rows).exec().then(()=> {
            //          firebase.saveBatteryFirstPlan(rows)
            //     })
            // })
        })
    }
}

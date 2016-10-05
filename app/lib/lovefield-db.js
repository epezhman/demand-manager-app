'use strict'

module.exports = {
    genericCaller
}

const config = require('../config')
const {remote} = require('electron')
const log = require('./log')
const makeTables = require('./lovefield-tables')
const firebase = remote.require('./lib/firebase')
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

var operations = {
    addBatteryWindows: function (params) {
        return Q.fcall(getDB).then(()=> {
            var battery = db.getSchema().table('Battery')
            log(params)
            var batteryObject = {
                'estimated_runtime': Number(params['batteryruntime-estimatedruntime']),
                'charge_rate': parseInt(params['batterystatus-chargerate']),
                'discharge_rate': parseInt(params['batterystatus-dischargerate']),
                'remaining_capacity': Number(params['batterystatus-remainingcapacity']),
                'voltage': parseInt(params['batterystatus-voltage']),
                'charging': params['batterystatus-charging'].toLowerCase() === "true",
                'discharging': params['batterystatus-discharging'].toLowerCase()=== "true",
                'power_online': params['batterystatus-poweronline'].toLowerCase() === "true",
                'time': new Date()
            }
            var row = battery.createRow(batteryObject)
            return db.insert().into(battery).values([row]).exec().then(()=> {
                firebase.saveBatteryData(batteryObject)
            })
        })
    }
}

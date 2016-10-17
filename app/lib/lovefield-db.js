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
    }
}

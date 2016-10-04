'use strict'

module.exports = {
    genericCaller
}

const config = require('../config')
const log = require('./log')
const makeTables = require('./lovefield-tables')
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
    })
}

var operations = {
    addOne: function () {
        return Q.fcall(getDB).then(()=> {
            var battery = db.getSchema().table('Battery')
            var row = battery.createRow({
                'status': true
            })
            return db.insert().into(battery).values([row]).exec()
        })
    }
}

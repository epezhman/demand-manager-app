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


function checkIfUndefined(value) {
    if (!value || value.toString() === 'undefined') {
        return ''
    }
    return value
}

function checkIfUndefinedNumber(value) {
    if (!value || value.toString() === 'undefined') {
        return 0
    }
    return value
}

function calculatePowerAverageConsumption(records) {
    var powerAverage = {}
    if (records.length === 2) {
        var count_1 = records[0]['ac_connected_count']
        var count_2 = records[1]['ac_connected_count']
        var count_all = count_1 + count_2
        powerAverage['ac_connected_bool'] = count_1 > count_2 ?
            records[0]['ac_connected_bool'] : records[1]['ac_connected_bool']
        powerAverage['remaining_time_minutes'] = Math.round(
            ((records[0]['remaining_time'] * count_1) + (records[1]['remaining_time'] * count_2)) / count_all)
        powerAverage['power_rate_w'] = Math.round(
                (((records[0]['power_rate'] * count_1) + (records[1]['power_rate'] * count_2)) / count_all) * 100) / 100
        powerAverage['remaining_capacity_percent'] = Math.round(
            ((records[0]['remaining_capacity'] * count_1) + (records[1]['remaining_capacity'] * count_2)) / count_all)
        powerAverage['voltage_v'] = Math.round(
                (((records[0]['voltage'] * count_1) + (records[1]['voltage'] * count_2)) / count_all) * 100) / 100
        return powerAverage
    }
    else if (records.length === 1) {
        powerAverage['remaining_time_minutes'] = Math.round(records[0]['remaining_time'])
        powerAverage['power_rate_w'] = Math.round(records[0]['power_rate'] * 100) / 100
        powerAverage['remaining_capacity_percent'] = Math.round(records[0]['remaining_capacity'])
        powerAverage['voltage_v'] = Math.round(records[0]['voltage'] * 100) / 100
        powerAverage['ac_connected_bool'] = records[0]['ac_connected_bool']
        return powerAverage
    }
}

// TODO Update the location and locations profiles
// TODO remaining time when 100 percent on ubuntu check that

var operations = {
    addBattery: function (batteryObject) {
        var dayOfWeek = utils.getDayOfWeek()
        var hoursOfDay = utils.getHoursOfDay()
        var powerAverage = {}
        return Q.fcall(getDB).then(()=> {
            batteryObject['time'] = new Date()
            batteryObject['day_of_week'] = dayOfWeek
            batteryObject['one_hour_duration_beginning'] = hoursOfDay
            var battery = db.getSchema().table('Battery')
            var row = battery.createRow(batteryObject)
            return db.insert().into(battery).values([row]).exec()
        }).then(()=> {
            var battery = db.getSchema().table('Battery')
            return db.select(
                battery.ac_connected_bool,
                lf.fn.count(battery.ac_connected_bool).as('ac_connected_count'),
                lf.fn.avg(battery.voltage_v).as('voltage'),
                lf.fn.avg(battery.remaining_time_minutes).as('remaining_time'),
                lf.fn.avg(battery.power_rate_w).as('power_rate'),
                lf.fn.avg(battery.remaining_capacity_percent).as('remaining_capacity'))
                .from(battery)
                .where(lf.op.and(
                    battery.day_of_week.eq(dayOfWeek),
                    battery.one_hour_duration_beginning.eq(hoursOfDay))
                )
                .groupBy(battery.ac_connected_bool)
                .exec()
        }).then((batteryRecords)=> {
            powerAverage = calculatePowerAverageConsumption(batteryRecords)
            if (powerAverage) {
                powerAverage['is_checked'] = true
            }
            var batteryProfile = db.getSchema().table('BatteryProfile')

            return db.select(batteryProfile.id, batteryProfile.is_checked, batteryProfile.day_of_week)
                .from(batteryProfile)
                .where(batteryProfile.one_hour_duration_beginning.eq(hoursOfDay))
                .exec()
        }).then((batteryProfileRecords)=> {
            var batteryProfile = db.getSchema().table('BatteryProfile')

            batteryProfileRecords.forEach((batteryProfileRecord)=> {
                if (!batteryProfileRecord['is_checked'] || batteryProfileRecord['day_of_week'] == dayOfWeek) {
                    log(batteryProfileRecord)
                    db.update(batteryProfile)
                        .set(batteryProfile.is_checked, powerAverage['is_checked'])
                        .set(batteryProfile.remaining_time_minutes, powerAverage['remaining_time_minutes'])
                        .set(batteryProfile.power_rate_w, powerAverage['power_rate_w'])
                        .set(batteryProfile.remaining_capacity_percent, powerAverage['remaining_capacity_percent'])
                        .set(batteryProfile.voltage_v, powerAverage['voltage_v'])
                        .set(batteryProfile.ac_connected_bool, powerAverage['ac_connected_bool'])
                        .where(batteryProfile.id.eq(batteryProfileRecord['id']))
                        .exec()
                        .then(()=> {
                            firebase.saveBatteryData(powerAverage, batteryProfileRecord['day_of_week'], hoursOfDay)
                        })
                }
            })
        })
    },
    addBatteryFirstProfile: function (batteryObject) {
        return Q.fcall(getDB).then(()=> {
            var batteryProfile = db.getSchema().table('BatteryProfile')
            return db.delete().from(batteryProfile).exec().then(()=> {
                var rows = []
                var firebaseRows = []
                for (var dayName in enums.WeekDays) {
                    if (enums.WeekDays.hasOwnProperty(dayName)) {
                        for (var hourName in enums.DayHours) {
                            if (enums.DayHours.hasOwnProperty(hourName)) {
                                var tempRow = {
                                    'remaining_time_minutes': batteryObject['remaining_time_minutes'],
                                    'power_rate_w': batteryObject['power_rate_w'],
                                    'remaining_capacity_percent': batteryObject['remaining_capacity_percent'],
                                    'voltage_v': batteryObject['voltage_v'],
                                    'ac_connected_bool': batteryObject['ac_connected_bool'],
                                    'day_of_week': enums.WeekDays[dayName],
                                    'one_hour_duration_beginning': enums.DayHours[hourName],
                                    'is_checked': false,
                                }
                                firebaseRows.push(tempRow)
                                rows.push(batteryProfile.createRow(tempRow))
                            }
                        }
                    }
                }
                return db.insert()
                    .into(batteryProfile)
                    .values(rows)
                    .exec()
                    .then(()=> {
                        firebase.saveBatteryFirstProfile(firebaseRows)
                    })
            })
        })
    },
    addLocation: function (locationData) {
        return Q.fcall(getDB).then(()=> {
            locationData['time'] = new Date()
            locationData['day_of_week'] = utils.getDayOfWeek()
            locationData['one_hour_duration_beginning'] = utils.getHoursOfDay()
            var location = db.getSchema().table('Location')
            var row = location.createRow(locationData)
            return db.insert()
                .into(location)
                .values([row])
                .exec()
                .then(()=> {
                    firebase.saveOnlineLocation(locationData)
                })
        })
    },
    addLocationFirstProfile: function (locationData) {
        return Q.fcall(getDB).then(()=> {
            var locationProfile = db.getSchema().table('LocationProfile')
            return db.delete()
                .from(locationProfile)
                .exec()
                .then(()=> {
                    var rows = []
                    var firebaseRows = []
                    for (var dayName in enums.WeekDays) {
                        if (enums.WeekDays.hasOwnProperty(dayName)) {
                            for (var hourName in enums.DayHours) {
                                if (enums.DayHours.hasOwnProperty(hourName)) {
                                    var tempRow = {
                                        'country_code': checkIfUndefined(locationData['country_code']),
                                        'country_name': checkIfUndefined(locationData['country_name']),
                                        'region_code': checkIfUndefined(locationData['region_code']),
                                        'region_name': checkIfUndefined(locationData['region_name']),
                                        'city': checkIfUndefined(locationData['city']),
                                        'zip_code': checkIfUndefined(locationData['zip_code']),
                                        'time_zone': checkIfUndefined(locationData['time_zone']),
                                        'latitude': locationData['latitude'],
                                        'longitude': locationData['longitude'],
                                        'accuracy': checkIfUndefinedNumber(locationData['accuracy']),
                                        'day_of_week': enums.WeekDays[dayName],
                                        'one_hour_duration_beginning': enums.DayHours[hourName],
                                        'is_checked': false,
                                    }
                                    firebaseRows.push(tempRow)
                                    rows.push(locationProfile.createRow(tempRow))
                                }
                            }
                        }
                    }
                    return db.insert()
                        .into(locationProfile)
                        .values(rows)
                        .exec()
                        .then(()=> {
                            firebase.saveLocationFirstProfile(firebaseRows)
                        })
                })
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

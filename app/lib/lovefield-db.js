'use strict'
/* jshint ignore:start */

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
const ConfigStore = require('configstore')
const momemt = require('moment')

const conf = new ConfigStore(config.APP_SHORT_NAME)

var db = null

var schemaBuilder = lf.schema.create(config.LOVEFIELD_DB_NAME, config.LOVEFIELD_DB_VERSION)

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
        var count1 = records[0]['ac_connected_count']
        var count2 = records[1]['ac_connected_count']
        var countAll = count1 + count2
        powerAverage['ac_connected_prob_percent'] = Math.round((records[0]['ac_connected_bool']
                ? count1 / countAll : count2 / countAll) * 100)
        powerAverage['remaining_time_minutes'] = Math.round(
            ((records[0]['remaining_time'] * count1) + (records[1]['remaining_time'] * count2)) / countAll)
        powerAverage['power_rate_w'] = Math.round(
                (((records[0]['power_rate'] * count1) + (records[1]['power_rate'] * count2)) / countAll) * 100) / 100
        powerAverage['remaining_capacity_percent'] = Math.round(
            ((records[0]['remaining_capacity'] * count1) + (records[1]['remaining_capacity'] * count2)) / countAll)
        powerAverage['voltage_v'] = Math.round(
                (((records[0]['voltage'] * count1) + (records[1]['voltage'] * count2)) / countAll) * 100) / 100
        return powerAverage
    }
    else if (records.length === 1) {
        powerAverage['remaining_time_minutes'] = Math.round(records[0]['remaining_time'])
        powerAverage['power_rate_w'] = Math.round(records[0]['power_rate'] * 100) / 100
        powerAverage['remaining_capacity_percent'] = Math.round(records[0]['remaining_capacity'])
        powerAverage['voltage_v'] = Math.round(records[0]['voltage'] * 100) / 100
        powerAverage['ac_connected_prob_percent'] = records[0]['ac_connected_bool'] ? 100 : 0
        return powerAverage
    }
}

function calculateLocationAverage(records) {
    var locationAverage = {}
    if (records.length) {
        var count = 0
        records.forEach((record)=> {
            if (count <= record['ip_count']) {
                locationAverage['longitude'] = record['longitude']
                locationAverage['latitude'] = record['latitude']
                locationAverage['accuracy'] = Math.round(record['accuracy'])
                count = record['ip_count']
            }
        })

        return locationAverage
    }
}

function addRunning() {
    var dayOfWeek = utils.getDayOfWeek()
    var hoursOfDay = utils.getHoursOfDay()
    return Q.fcall(getDB).then(()=> {
        var running = db.getSchema().table('Running')
        var row = running.createRow({
            'app_running_bool': true,
            'computer_running_bool': true,
            'day_of_week': dayOfWeek,
            'one_hour_duration_beginning': hoursOfDay,
            'auto_start_set_bool': conf.get('run-on-start-up') ? true : false,
            'time': new Date()
        })
        return db.insert()
            .into(running)
            .values([row]
            ).exec()
    }).then(()=> {
        var running = db.getSchema().table('Running')

        return db.select(running.time)
            .from(running)
            .limit(2)
            .orderBy(running.time, lf.Order.DESC)
            .exec()
    }).then((runningRecords)=> {
        if (runningRecords.length = 2) {
            var hoursDif = Math.floor((runningRecords[0].time - runningRecords[1].time) / 3600000)
            var running = db.getSchema().table('Running')
            var rows = []
            var lastDateTime = runningRecords[1].time
            var autoStartSet = conf.get('run-on-start-up') ? true : false
            for (var i = 0; i < hoursDif; i++) {
                var tempDate = momemt(lastDateTime).add(i, 'h').toDate()
                rows.push(running.createRow({
                    'app_running_bool': false,
                    'computer_running_bool': false,
                    'auto_start_set_bool': autoStartSet,
                    'day_of_week': utils.getDayOfWeek(tempDate.getDay()),
                    'one_hour_duration_beginning': tempDate.getHours(),
                    'time': tempDate
                }))
            }
            return db.insert()
                .into(running)
                .values(rows).exec()
        }
    })
}

function updateRunningProfile() {
    var sumAll = {}
    return Q.fcall(getDB).then(()=> {
        var running = db.getSchema().table('Running')
        return db.select(running.day_of_week, running.one_hour_duration_beginning,
            running.app_running_bool, running.computer_running_bool,
            lf.fn.count(running.id).as('count'))
            .from(running)
            .groupBy(running.day_of_week, running.one_hour_duration_beginning,
                running.app_running_bool, running.computer_running_bool)
            .exec()
    }).then((profileRecords)=> {
        profileRecords.forEach((profileRecord)=> {
            var profileKey = `${profileRecord['day_of_week']}_${profileRecord['one_hour_duration_beginning']}`
            var count = profileRecord['count']
            if (sumAll[profileKey]) {
                sumAll[profileKey]['app_running_true'] += profileRecord['app_running_bool'] ? count : 0
                sumAll[profileKey]['app_running_false'] += profileRecord['app_running_bool'] ? 0 : count
                sumAll[profileKey]['computer_running_true'] += profileRecord['computer_running_bool'] ? count : 0
                sumAll[profileKey]['computer_running_false'] += profileRecord['computer_running_bool'] ? 0 : count
                sumAll[profileKey]['count'] += profileRecord['count']
            }
            else {
                sumAll[profileKey] = {
                    'app_running_true': profileRecord['app_running_bool'] ? count : 0,
                    'app_running_false': profileRecord['app_running_bool'] ? 0 : count,
                    'computer_running_true': profileRecord['computer_running_bool'] ? count : 0,
                    'computer_running_false': profileRecord['computer_running_bool'] ? 0 : count,
                    'count': profileRecord['count'],
                }
            }
        })
        var batteryProfile = db.getSchema().table('BatteryProfile')
        for (var _key in sumAll) if (sumAll.hasOwnProperty(_key)) {
            var count = sumAll[_key]['count']
            var app_running = Math.round((sumAll[_key]['app_running_false'] / count) * 100)
            var computer_running = Math.round((sumAll[_key]['computer_running_true'] / count) * 100)
            var days_hours = _key.split('_')
            db.update(batteryProfile)
                .set(batteryProfile.app_running_prob_percent, app_running)
                .set(batteryProfile.computer_running_prob_percent, computer_running)
                .where(lf.op.and(
                    batteryProfile.day_of_week.eq(days_hours[0]),
                    batteryProfile.one_hour_duration_beginning.eq(days_hours[1])))
                .exec()
                .then(()=> {
                    firebase.updateRunningProfile(days_hours[0], days_hours[1], app_running, computer_running)
                })

        }
    })
}

function addBattery(batteryObject) {
    var dayOfWeek = utils.getDayOfWeek()
    var hoursOfDay = utils.getHoursOfDay()
    var avgPower = conf.get('power-rate-avg') ? conf.get('power-rate-avg') : 15
    var maxTime = conf.get('remaining-time-max') ? conf.get('remaining-time-max') : 60
    var powerAverage = {}
    return Q.fcall(getDB).then(()=> {
        batteryObject['time'] = new Date()
        batteryObject['day_of_week'] = dayOfWeek
        batteryObject['one_hour_duration_beginning'] = hoursOfDay
        if (batteryObject['remaining_capacity_percent'] > 95) {
            if (batteryObject['power_rate_w'] === 0) {
                batteryObject['power_rate_w'] = avgPower
            }
            if (batteryObject['remaining_time_minutes'] === 0) {
                batteryObject['remaining_time_minutes'] = maxTime
            }
        }
        var battery = db.getSchema().table('Battery')
        var row = battery.createRow(batteryObject)
        return db.insert()
            .into(battery)
            .values([row]
            ).exec()
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
            if (!batteryProfileRecord['is_checked'] || batteryProfileRecord['day_of_week'] === dayOfWeek) {
                db.update(batteryProfile)
                    .set(batteryProfile.is_checked, powerAverage['is_checked'])
                    .set(batteryProfile.remaining_time_minutes, powerAverage['remaining_time_minutes'])
                    .set(batteryProfile.power_rate_w, powerAverage['power_rate_w'])
                    .set(batteryProfile.remaining_capacity_percent, powerAverage['remaining_capacity_percent'])
                    .set(batteryProfile.voltage_v, powerAverage['voltage_v'])
                    .set(batteryProfile.ac_connected_prob_percent, powerAverage['ac_connected_prob_percent'])
                    .where(batteryProfile.id.eq(batteryProfileRecord['id']))
                    .exec()
                    .then(()=> {
                        firebase.updateBatteryProfile(powerAverage, batteryProfileRecord['day_of_week'], hoursOfDay)
                    })
            }
        })
    })
}

function addBatteryFirstProfile(batteryObject) {
    return Q.fcall(getDB).then(()=> {
        var batteryProfile = db.getSchema().table('BatteryProfile')
        return db.delete().from(batteryProfile).exec().then(()=> {
            var rows = []
            var firebaseRows = []
            for (var dayName in enums.WeekDays) if (enums.WeekDays.hasOwnProperty(dayName)) {
                for (var hourName in enums.DayHours) if (enums.DayHours.hasOwnProperty(hourName)) {
                    var tempRow = {
                        'remaining_time_minutes': batteryObject['remaining_time_minutes'],
                        'power_rate_w': batteryObject['power_rate_w'],
                        'remaining_capacity_percent': batteryObject['remaining_capacity_percent'],
                        'voltage_v': batteryObject['voltage_v'],
                        'ac_connected_prob_percent': 50,
                        'day_of_week': enums.WeekDays[dayName],
                        'one_hour_duration_beginning': enums.DayHours[hourName],
                        'is_checked': false,
                        'app_running_bool': true,
                        'computer_running_bool': true,
                        'app_running_prob_percent': 50,
                        'computer_running_prob_percent': 50
                    }
                    if (enums.DayHours[hourName] <= 7) {
                        tempRow['power_rate_w'] = 0
                        tempRow['voltage_v'] = 0
                        tempRow['app_running_prob_percent'] = 0
                        tempRow['computer_running_prob_percent'] = 0
                    }
                    firebaseRows.push(tempRow)
                    rows.push(batteryProfile.createRow(tempRow))
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
}

function addLocation(locationData) {
    var dayOfWeek = utils.getDayOfWeek()
    var hoursOfDay = utils.getHoursOfDay()
    var locationAverage = {}
    return Q.fcall(getDB).then(()=> {
        var location = db.getSchema().table('Location')
        var row = location.createRow({
            'time': new Date(),
            'day_of_week': dayOfWeek,
            'one_hour_duration_beginning': hoursOfDay,
            'country_code': checkIfUndefined(locationData['country-code']),
            'country_name': checkIfUndefined(locationData['country-name']),
            'region_code': checkIfUndefined(locationData['region-code']),
            'region_name': checkIfUndefined(locationData['region-name']),
            'city': checkIfUndefined(locationData['city']),
            'time_zone': checkIfUndefined(locationData['time-zone']),
            'zip_code': checkIfUndefinedNumber(locationData['zip-code']),
            'ip': checkIfUndefined(locationData['ip']),
            'latitude': locationData['latitude'],
            'longitude': locationData['longitude'],
            'accuracy': checkIfUndefinedNumber(locationData['accuracy'])
        })
        return db.insert()
            .into(location)
            .values([row])
            .exec()
            .then(()=> {
                firebase.saveOnlineLocation(locationData)
            })
    }).then(()=> {
        var location = db.getSchema().table('Location')
        return db.select(
            location.ip,
            lf.fn.count(location.ip).as('ip_count'),
            lf.fn.avg(location.latitude).as('latitude'),
            lf.fn.avg(location.longitude).as('longitude'),
            lf.fn.avg(location.accuracy).as('accuracy'))
            .from(location)
            .where(lf.op.and(
                location.day_of_week.eq(dayOfWeek),
                location.one_hour_duration_beginning.eq(hoursOfDay))
            )
            .groupBy(location.ip)
            .exec()
    }).then((locationRecords)=> {
        locationAverage = calculateLocationAverage(locationRecords)
        if (locationAverage) {
            locationAverage['is_checked'] = true
        }
        var locationProfile = db.getSchema().table('LocationProfile')

        return db.select(locationProfile.id, locationProfile.is_checked, locationProfile.day_of_week)
            .from(locationProfile)
            .where(locationProfile.one_hour_duration_beginning.eq(hoursOfDay))
            .exec()
    }).then((locationProfileRecords)=> {
        var locationProfile = db.getSchema().table('LocationProfile')
        locationProfileRecords.forEach((locationProfileRecord)=> {
            if (!locationProfileRecord['is_checked'] || locationProfileRecord['day_of_week'] === dayOfWeek) {
                db.update(locationProfile)
                    .set(locationProfile.is_checked, locationAverage['is_checked'])
                    .set(locationProfile.latitude, locationAverage['latitude'])
                    .set(locationProfile.longitude, locationAverage['longitude'])
                    .set(locationProfile.accuracy, locationAverage['accuracy'])
                    .where(locationProfile.id.eq(locationProfileRecord['id']))
                    .exec()
                    .then(()=> {
                        firebase.updateLocationProfile(locationAverage, locationProfileRecord['day_of_week'], hoursOfDay)
                    })
            }
        })
    })
}

function addLocationFirstProfile(locationData) {
    return Q.fcall(getDB).then(()=> {
        var locationProfile = db.getSchema().table('LocationProfile')
        return db.delete()
            .from(locationProfile)
            .exec()
            .then(()=> {
                var rows = []
                var firebaseRows = []
                for (var dayName in enums.WeekDays) if (enums.WeekDays.hasOwnProperty(dayName)) {
                    for (var hourName in enums.DayHours) if (enums.DayHours.hasOwnProperty(hourName)) {
                        var tempRow = {
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

function deleteAllData() {
    return Q.fcall(getDB).then(()=> {
        var battery = db.getSchema().table('Battery')
        var batteryProfile = db.getSchema().table('BatteryProfile')
        var location = db.getSchema().table('Location')
        var locationProfile = db.getSchema().table('LocationProfile')
        var running = db.getSchema().table('Running')

        return db.delete()
            .from(battery)
            .exec()
            .then(()=> {
                return db.delete()
                    .from(batteryProfile)
                    .exec()
            }).then(()=> {
                return db.delete()
                    .from(location)
                    .exec()
            }).then(()=> {
                return db.delete()
                    .from(locationProfile)
                    .exec()
            }).then(()=> {
                return db.delete()
                    .from(running)
                    .exec()
            })
    })
}

function powerStats() {
    return Q.fcall(getDB).then(()=> {
        var battery = db.getSchema().table('Battery')
        return db.select(
            lf.fn.avg(battery.power_rate_w).as('power_rate'),
            lf.fn.max(battery.remaining_time_minutes).as('remaining_time'))
            .from(battery)
            .exec()
    }).then((statRecords)=> {
        statRecords.forEach((statRecord)=> {
            conf.set('power-rate-avg', Math.round(statRecord['power_rate']))
            conf.set('remaining-time-max', statRecord['remaining_time'])
        })
    })
}

var operations = {
    addRunning: addRunning,
    updateRunningProfile: updateRunningProfile,
    addBattery: addBattery,
    addBatteryFirstProfile: addBatteryFirstProfile,
    addLocation: addLocation,
    addLocationFirstProfile: addLocationFirstProfile,
    deleteAllData: deleteAllData,
    powerStats: powerStats
}

function genericCaller(op, cb) {
    return operations[op.fn](op.params).then(()=> {
        cb()
    }).catch((e) => {
        log.error(e)
    })
}
/* jshint ignore:end */
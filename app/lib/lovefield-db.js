'use strict'
/* jshint ignore:start */

module.exports = {
    genericCaller
}

const config = require('../config')
const {remote} = require('electron')
const log = remote.require('./lib/log')
const makeTables = require('./lovefield-tables')
const firebase = remote.require('./lib/firebase')
const utils = require('./utils')
const enums = require('./enums')
const lf = require('lovefield')
const Q = require('q')
const async = require('async')
const ConfigStore = require('configstore')
const moment = require('moment')
const _ = require('lodash')


const conf = new ConfigStore(config.APP_SHORT_NAME)

let db = null

const schemaBuilder = lf.schema.create(config.LOVEFIELD_DB_NAME, config.LOVEFIELD_DB_VERSION)

makeTables(schemaBuilder)

function getDB() {
    if (db !== null) {
        return db
    }
    else {
        return schemaBuilder.connect().then((_db) => {
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

function calculateAveragePowerProfile(records) {
    let powerAverage = {}
    if (records.length === 2) {
        let count1 = records[0]['ac_connected_count']
        let count2 = records[1]['ac_connected_count']
        let countAll = count1 + count2
        powerAverage['ac_connected_prob_percent'] = Math.round((records[0]['ac_connected_bool']
                ? count1 / countAll : count2 / countAll) * 100)
        powerAverage['estimated_power_save_w'] = Math.round((((records[0]['estimated_power_save'] * count1) +
                (records[1]['estimated_power_save'] * count2)) / countAll) * 100) / 100
        powerAverage['estimated_power_consume_w'] = Math.round((((records[0]['estimated_power_consume'] * count1) +
                (records[1]['estimated_power_consume'] * count2)) / countAll) * 100) / 100
        return powerAverage
    }
    else if (records.length === 1) {
        powerAverage['estimated_power_save_w'] = Math.round(records[0]['estimated_power_save'] * 100) / 100
        powerAverage['estimated_power_consume_w'] = Math.round(records[0]['estimated_power_consume'] * 100) / 100
        powerAverage['ac_connected_prob_percent'] = records[0]['ac_connected_bool'] ? 100 : 0
        return powerAverage
    }
}

function calculateAverageLocationProfile(records) {
    // let locationAverage = {
    //     'longitude': 1.4,
    //     'latitude': 1.4,
    //     'accuracy': 50
    // }
    //let counter = records.length
    records.forEach((recordLocation) => {
    })

    return {
        'longitude': 1.4,
        'latitude': 1.4,
        'accuracy': 50
    }
}

function addRunning() {
    let dayOfWeek = utils.getDayOfWeek()
    let hoursOfDay = utils.getHoursOfDay()
    let minutesOfHours = utils.getMinutesOfHour()

    return Q.fcall(getDB).then(() => {
        let running = db.getSchema().table('Running')
        let row = running.createRow({
            'app_running_bool': true,
            'computer_running_bool': true,
            'day_of_week': dayOfWeek,
            'hour_index': hoursOfDay,
            'minute_index': minutesOfHours,
            'auto_start_set_bool': !!conf.get('run-on-start-up'),
            'time': moment().toDate()
        })
        return db.insert()
            .into(running)
            .values([row])
            .exec()
    }).then(() => {
        let running = db.getSchema().table('Running')
        return db.select(running.time)
            .from(running)
            .limit(2)
            .orderBy(running.time, lf.Order.DESC)
            .exec()
    }).then((runningRecords) => {
        if (runningRecords.length === 2) {
            let minutesDif = Math.floor((runningRecords[0].time - runningRecords[1].time) / 60000)
            let running = db.getSchema().table('Running')
            let rows = []
            let lastDateTime = runningRecords[1].time
            let autoStartSet = !!conf.get('run-on-start-up')
            for (let i = 0; i < minutesDif; i++) {
                let tempDate = moment(lastDateTime).add(i, 'm').toDate()
                rows.push(running.createRow({
                    'app_running_bool': false,
                    'computer_running_bool': false,
                    'auto_start_set_bool': autoStartSet,
                    'day_of_week': utils.getDayOfWeek(tempDate.getDay()),
                    'hour_index': tempDate.getHours(),
                    'minute_index': tempDate.getMinutes(),
                    'time': tempDate
                }))
            }
            return db.insert()
                .into(running)
                .values(rows)
                .exec()
        }
    })
}

function updateRunningProfile() {
    let sumAll = {}
    return Q.fcall(getDB).then(() => {
        let running = db.getSchema().table('Running')
        return db.select(running.day_of_week,
            running.hour_index,
            running.minute_index,
            running.app_running_bool,
            running.computer_running_bool,
            lf.fn.count(running.id).as('count'))
            .from(running)
            .groupBy(running.day_of_week,
                running.hour_index,
                running.minute_index,
                running.app_running_bool,
                running.computer_running_bool)
            .exec()
    }).then((profileRecords) => {
        profileRecords.forEach((profileRecord) => {
            let profileKey = `${profileRecord['day_of_week']}_${profileRecord['hour_index']}_${profileRecord['minute_index']}`
            let count = profileRecord['count']
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
        let batteryProfile = db.getSchema().table('BatteryProfile')
        for (let _key in sumAll) if (sumAll.hasOwnProperty(_key)) {
            let count = sumAll[_key]['count']
            let app_running = Math.round((sumAll[_key]['app_running_false'] / count) * 100)
            let computer_running = Math.round((sumAll[_key]['computer_running_true'] / count) * 100)
            let days_hours_minutes = _key.split('_')
            db.update(batteryProfile)
                .set(batteryProfile.app_running_prob_percent, app_running)
                .set(batteryProfile.computer_running_prob_percent, computer_running)
                .where(lf.op.and(
                    batteryProfile.day_of_week.eq(days_hours_minutes[0]),
                    batteryProfile.hour_index.eq(days_hours_minutes[1]),
                    batteryProfile.minute_index.eq(days_hours_minutes[2])))
                .exec()
                .then(() => {
                    firebase.updateRunningProfile(days_hours_minutes[0], days_hours_minutes[1],
                        days_hours_minutes[2], app_running, computer_running)
                })
        }
    })
}

function addBattery(batteryObject) {
    let dayOfWeek = utils.getDayOfWeek()
    let hoursOfDay = utils.getHoursOfDay()
    let minutesOfHours = utils.getMinutesOfHour()

    let powerAverage = {}
    return Q.fcall(getDB).then(() => {
        batteryObject['time'] = moment().toDate()
        batteryObject['day_of_week'] = dayOfWeek
        batteryObject['hour_index'] = hoursOfDay
        batteryObject['minute_index'] = minutesOfHours

        let battery = db.getSchema().table('Battery')
        let row = battery.createRow(batteryObject)
        return db.insert()
            .into(battery)
            .values([row])
            .exec()
    }).then(() => {
        let battery = db.getSchema().table('Battery')
        return db.select(battery.ac_connected_bool,
            lf.fn.count(battery.ac_connected_bool).as('ac_connected_count'),
            lf.fn.avg(battery.estimated_power_save_w).as('estimated_power_save'),
            lf.fn.avg(battery.estimated_power_consume_w).as('estimated_power_consume'))
            .from(battery)
            .where(lf.op.and(
                battery.day_of_week.eq(dayOfWeek),
                battery.hour_index.eq(hoursOfDay),
                battery.minute_index.eq(minutesOfHours)))
            .groupBy(battery.ac_connected_bool)
            .exec()
    }).then((batteryRecords) => {
        powerAverage = calculateAveragePowerProfile(batteryRecords)
        if (powerAverage) {
            powerAverage['is_checked'] = true
        }
        let batteryProfile = db.getSchema().table('BatteryProfile')
        return db.select(batteryProfile.id,
            batteryProfile.is_checked,
            batteryProfile.day_of_week)
            .from(batteryProfile)
            .where(lf.op.and(
                batteryProfile.hour_index.eq(hoursOfDay),
                batteryProfile.minute_index.eq(minutesOfHours)))
            .exec()
    }).then((batteryProfileRecords) => {
        let batteryProfile = db.getSchema().table('BatteryProfile')

        batteryProfileRecords.forEach((batteryProfileRecord) => {
            if (!batteryProfileRecord['is_checked'] || batteryProfileRecord['day_of_week'] === dayOfWeek) {
                db.update(batteryProfile)
                    .set(batteryProfile.is_checked, powerAverage['is_checked'])
                    .set(batteryProfile.estimated_power_save_w, powerAverage['estimated_power_save_w'])
                    .set(batteryProfile.estimated_power_consume_w, powerAverage['estimated_power_consume_w'])
                    .set(batteryProfile.ac_connected_prob_percent, powerAverage['ac_connected_prob_percent'])
                    .where(batteryProfile.id.eq(batteryProfileRecord['id']))
                    .exec()
                    .then(() => {
                        firebase.updateBatteryProfile(batteryProfileRecord['day_of_week'], hoursOfDay,
                            minutesOfHours, powerAverage)
                    })
            }
        })
    })
}

function addBatteryFirstProfile(batteryObject) {
    return Q.fcall(getDB).then(() => {
        let batteryProfile = db.getSchema().table('BatteryProfile')
        return db.delete()
            .from(batteryProfile)
            .exec()
    }).then(() => {
        let batteryProfile = db.getSchema().table('BatteryProfile')
        let rows = []
        let firebaseRows = []

        for (let dayName in enums.WeekDays) if (enums.WeekDays.hasOwnProperty(dayName)) {
            for (let hour of _.range(24)) {
                for (let minute of _.range(60)) {
                    let tempRow = {
                        'estimated_power_save_w': batteryObject['estimated_power_save_w'],
                        'estimated_power_consume_w': batteryObject['estimated_power_consume_w'],
                        'ac_connected_prob_percent': 50,
                        'app_running_prob_percent': 50,
                        'computer_running_prob_percent': 50,
                        'day_of_week': enums.WeekDays[dayName],
                        'hour_index': hour,
                        'minute_index': minute,
                        'is_checked': false
                    }
                    if (hour <= 7) {
                        tempRow['estimated_power_save_w'] = 0
                        tempRow['estimated_power_consume_w'] = 0
                        tempRow['app_running_prob_percent'] = 0
                        tempRow['computer_running_prob_percent'] = 0
                    }
                    firebaseRows.push(tempRow)
                    rows.push(batteryProfile.createRow(tempRow))
                }
            }
        }
        return db.insert()
            .into(batteryProfile)
            .values(rows)
            .exec()
            .then(() => {
                firebase.saveBatteryFirstProfile(firebaseRows)
            })
    })
}

function addLocation(locationData) {
    let dayOfWeek = utils.getDayOfWeek()
    let hoursOfDay = utils.getHoursOfDay()
    let minutesOfHours = utils.getMinutesOfHourForLocation()

    let locationAverage = {}
    return Q.fcall(getDB).then(() => {
        let location = db.getSchema().table('Location')
        let row = location.createRow({
            'time': moment().toDate(),
            'day_of_week': dayOfWeek,
            'hour_index': hoursOfDay,
            'minute_index': minutesOfHours,
            'country_code': checkIfUndefined(locationData['country-code']),
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
            .then(() => {
                firebase.saveOnlineLocation(locationData)
            })
    }).then(() => {
        let location = db.getSchema().table('Location')
        return db.select(
            location.accuracy,
            location.latitude,
            location.longitude)
            .from(location)
            .where(lf.op.and(
                location.day_of_week.eq(dayOfWeek),
                location.hour_index.eq(hoursOfDay),
                location.minute_index.eq(minutesOfHours),
                location.accuracy.lt(500)))
            .orderBy(location.time, lf.Order.DESC)
            .limit(10)
            .exec()
    }).then((locationRecords) => {
        locationAverage = calculateAverageLocationProfile(locationRecords)
        if (locationAverage) {
            locationAverage['is_checked'] = true
        }
        let locationProfile = db.getSchema().table('LocationProfile')

        return db.select(locationProfile.id,
            locationProfile.is_checked,
            locationProfile.day_of_week)
            .from(locationProfile)
            .where(lf.op.and(
                locationProfile.hour_index.eq(hoursOfDay),
                locationProfile.minute_index.eq(minutesOfHours)))
            .exec()
    }).then((locationProfileRecords) => {
        let locationProfile = db.getSchema().table('LocationProfile')
        locationProfileRecords.forEach((locationProfileRecord) => {
            if (!locationProfileRecord['is_checked'] || locationProfileRecord['day_of_week'] === dayOfWeek) {
                db.update(locationProfile)
                    .set(locationProfile.is_checked, locationAverage['is_checked'])
                    .set(locationProfile.latitude, locationAverage['latitude'])
                    .set(locationProfile.longitude, locationAverage['longitude'])
                    .set(locationProfile.accuracy, locationAverage['accuracy'])
                    .where(locationProfile.id.eq(locationProfileRecord['id']))
                    .exec()
                    .then(() => {
                        firebase.updateLocationProfile(locationProfileRecord['day_of_week'], hoursOfDay,
                            minutesOfHours, locationAverage)
                    })
            }
        })
    })
}

function addLocationFirstProfile(locationData) {
    return Q.fcall(getDB).then(() => {
        let locationProfile = db.getSchema().table('LocationProfile')
        return db.delete()
            .from(locationProfile)
            .exec()
    }).then(() => {
        let locationProfile = db.getSchema().table('LocationProfile')
        let rows = []
        let firebaseRows = []
        let minutesRange = [0, 15, 30, 45]

        for (let dayName in enums.WeekDays) if (enums.WeekDays.hasOwnProperty(dayName)) {
            for (let hour of _.range(24)) {
                for (let minute of minutesRange) {
                    let tempRow = {
                        'latitude': locationData['latitude'],
                        'longitude': locationData['longitude'],
                        'accuracy': checkIfUndefinedNumber(locationData['accuracy']),
                        'day_of_week': enums.WeekDays[dayName],
                        'hour_index': hour,
                        'minute_index': minute,
                        'is_checked': false,
                    }
                    firebaseRows.push(tempRow)
                    rows.push(locationProfile.createRow(tempRow))
                }
            }
        }
        return db.insert()
            .into(locationProfile)
            .values(rows)
            .exec()
            .then(() => {
                firebase.saveLocationFirstProfile(firebaseRows)
            })
    })
}

function deleteAllData() {
    return Q.fcall(getDB).then(() => {
        let battery = db.getSchema().table('Battery')
        let batteryProfile = db.getSchema().table('BatteryProfile')
        let location = db.getSchema().table('Location')
        let locationProfile = db.getSchema().table('LocationProfile')
        let running = db.getSchema().table('Running')
        return db.delete()
            .from(battery)
            .exec()
            .then(() => {
                return db.delete()
                    .from(batteryProfile)
                    .exec()
            }).then(() => {
                return db.delete()
                    .from(location)
                    .exec()
            }).then(() => {
                return db.delete()
                    .from(locationProfile)
                    .exec()
            }).then(() => {
                return db.delete()
                    .from(running)
                    .exec()
            })
    })
}

function deleteOutDatedData() {
    return Q.fcall(getDB).then(() => {
        let battery = db.getSchema().table('Battery')
        let location = db.getSchema().table('Location')
        let running = db.getSchema().table('Running')
        let daysBefore = moment().subtract(conf.get('days-delete-db'), 'days').toDate()
        return db.delete()
            .from(battery)
            .where(battery.time.lt(daysBefore))
            .exec()
            .then(() => {
                return db.delete()
                    .from(location)
                    .where(location.time.lt(daysBefore))
                    .exec()
            }).then(() => {
                return db.delete()
                    .from(running)
                    .where(running.time.lt(daysBefore))
                    .exec()
            })
    })
}

const operations = {
    getDB: getDB,
    addRunning: addRunning,
    updateRunningProfile: updateRunningProfile,
    addBattery: addBattery,
    addBatteryFirstProfile: addBatteryFirstProfile,
    addLocation: addLocation,
    addLocationFirstProfile: addLocationFirstProfile,
    deleteAllData: deleteAllData,
    deleteOutDatedData: deleteOutDatedData
}

function genericCaller(op, cb) {
    return operations[op.fn](op.params).then(() => {
        cb()
    }).catch((e) => {
        log.sendError({'message': e.message, 'stack': e.url, 'lineNumber': e.lineNumber})
    })
}

window.onerror = function rendererErrorHandler(errorMsg, url, lineNumber) {
    log.sendError({'message': errorMsg, 'stack': url, 'lineNumber': lineNumber})
    return false;
}

/* jshint ignore:end */
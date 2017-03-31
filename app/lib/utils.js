'use strict'

module.exports = {
    convertWmicStringToList,
    standardizeForFirebase,
    tryConvertToJson,
    hoursToMinutes,
    getDayOfWeek,
    getHoursOfDay,
    getArbDayOfWeek,
    getDayNum,
    standardizeObject,
    standardizeNumberObject,
    getMinutesOfHour,
    getMinutesOfHourForLocation,
    getHoursOfDayOneMinuteBefore,
    getMinutesOfHourOneMinuteBefore,
    getDayOfWeekOneMinuteBefore
}

const fkey = require('firebase-safekey')
const _ = require('lodash')
const log = require('./log')
const enums = require('./enums')
const moment = require('moment')

fkey.config({
    '.': '-',
    '$': '-',
    '#': '-',
    '[': '-',
    ']': '-',
    '/': '-'
})

function convertWmicStringToList(str) {
    if (str.includes(`\r\r`)) {
        return _.split(str.replace(/\r\r/g, ','), /[, ]+/g)
    }
    return str
}


function standardizeForFirebase(jsonStr) {
    return JSON.parse(jsonStr, (key, value) => {
        if (value && typeof value === 'object') {
            for (let k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                    value[`-${fkey.safe(k)}`] = value[k]
                    delete value[k]
                }
            }
        }
        return value
    })
}


function tryConvertToJson(orgStr) {
    orgStr = _.trim(orgStr)
    let splitData = _.split(orgStr, '\n')
    if (splitData.length === 1) {
        return orgStr
    }
    let cntr = 0
    let resultJson = {}
    _.forEach(splitData, (value) => {
        value = _.trim(value)
        let tempSplit = _.split(value, ':')
        if (tempSplit.length === 1) {
            tempSplit = _.split(value, '=')
        }
        if (tempSplit.length === 2) {
            resultJson[fkey.safe(_.trim(tempSplit[0]))] = _.trim((tempSplit[1]))
        }
        else if (tempSplit.length > 2) {
            resultJson[fkey.safe(_.trim(tempSplit[0]))] = _.trim(_.join(_.tail(tempSplit), ':'))
        }
        else {
            resultJson[cntr++] = value
        }
    })
    return resultJson
}


function hoursToMinutes(time) {
    let tempTime = time * 100
    let hours = Math.floor(tempTime / 100)
    let minutes = tempTime % 100
    return hours * 60 + Math.round((minutes / 100) * 60)
}


function getDayOfWeek() {
    switch (new Date().getDay()) {
        case 0:
            return enums.WeekDays.SUNDAY
        case 1:
            return enums.WeekDays.MONDAY
        case 2:
            return enums.WeekDays.TUESDAY
        case 3:
            return enums.WeekDays.WEDNESDAY
        case 4:
            return enums.WeekDays.THURSDAY
        case 5:
            return enums.WeekDays.FRIDAY
        case 6:
            return enums.WeekDays.SATURDAY
    }
}

function getDayOfWeekOneMinuteBefore() {
    switch (moment().subtract(1, 'minutes').toDate().getDay()) {
        case 0:
            return enums.WeekDays.SUNDAY
        case 1:
            return enums.WeekDays.MONDAY
        case 2:
            return enums.WeekDays.TUESDAY
        case 3:
            return enums.WeekDays.WEDNESDAY
        case 4:
            return enums.WeekDays.THURSDAY
        case 5:
            return enums.WeekDays.FRIDAY
        case 6:
            return enums.WeekDays.SATURDAY
    }
}

function getDayNum(d) {
    switch (d) {
        case 'sun':
            return 0
        case 'mon':
            return 1
        case 'tue':
            return 2
        case 'wed':
            return 3
        case 'thu':
            return 4
        case 'fri':
            return 5
        case 'sat':
            return 6
    }
}


function getArbDayOfWeek(d) {
    switch (d) {
        case 0:
            return enums.WeekDays.SUNDAY
        case 1:
            return enums.WeekDays.MONDAY
        case 2:
            return enums.WeekDays.TUESDAY
        case 3:
            return enums.WeekDays.WEDNESDAY
        case 4:
            return enums.WeekDays.THURSDAY
        case 5:
            return enums.WeekDays.FRIDAY
        case 6:
            return enums.WeekDays.SATURDAY
    }
}

function getHoursOfDay() {
    return new Date().getHours()
}

function getMinutesOfHour() {
    return new Date().getMinutes()
}

function getHoursOfDayOneMinuteBefore() {
    return moment().subtract(1, 'minutes').hours()
}

function getMinutesOfHourOneMinuteBefore() {
    return moment().subtract(1, 'minutes').minutes()
}


function getMinutesOfHourForLocation() {
    let minutes = new Date().getMinutes()
    if (minutes < 15) {
        return 0
    }
    if (minutes < 30) {
        return 15
    }
    if (minutes < 45) {
        return 30
    }
    return 45
}

function standardizeObject(dirty) {
    for (let key in dirty) {
        if (dirty.hasOwnProperty(key)) {
            dirty[key] = Number.isNaN(dirty[key]) ? 'NaN' : dirty[key]
        }
    }
    return dirty
}


function standardizeNumberObject(dirty) {
    for (let key in dirty) {
        if (dirty.hasOwnProperty(key)) {
            dirty[key] = Number.isNaN(dirty[key]) ? 0 : dirty[key]
        }
    }
    return dirty
}
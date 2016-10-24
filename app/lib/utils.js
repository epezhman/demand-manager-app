'use strict'

module.exports = {
    convertWmicStringToList,
    standardizeForFirebase,
    tryConvertToJson,
    hoursToMinutes,
    getDayOfWeek,
    getHoursOfDay,
    getArbDayOfWeek
}

const fkey = require('firebase-safekey')
const _ = require('lodash')
const log = require('./log')
const enums = require('./enums')

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
    return JSON.parse(jsonStr, (key, value)=> {
        if (value && typeof value === 'object') {
            for (var k in value) {
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
    var splitData = _.split(orgStr, '\n')
    if (splitData.length === 1) {
        return orgStr
    }
    var cntr = 0
    var resultJson = {}
    _.forEach(splitData, (value)=> {
        value = _.trim(value)
        var tempSplit = _.split(value, ':')
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
    var tempTime = time * 100
    var hours = Math.floor(tempTime / 100)
    var minutes = tempTime % 100
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

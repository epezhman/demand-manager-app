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
    getDistanceFromLatLonInKm,
    distanceLatLonKm,
    getMinutesOfHour,
    getMinutesOfHourForLocation
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

function distanceLatLonKm(lat1, lon1, lat2, lon2) {
    let radLat1 = Math.PI * lat1 / 180
    let radLat2 = Math.PI * lat2 / 180
    let theta = lon1 - lon2
    let radtheta = Math.PI * theta / 180
    let dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radtheta)
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515 * 1.609344
    return dist
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    let R = 6371 // Radius of the earth in km
    let dLat = deg2rad(lat2 - lat1)  // deg2rad below
    let dLon = deg2rad(lon2 - lon1)
    let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

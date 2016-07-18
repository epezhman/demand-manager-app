'use strict'

module.exports = {
    init,
    monitorGeoLocation,
    monitorComputerModel
}

const config = require('../config')
const windows = require('../main/windows')
const modelExtractor = require('./model-extractor')

function monitorGeoLocation() {
    windows.gelocation.init()
    setTimeout(monitorGeoLocation, config.MONITOR_GEOLOCATION_INTERVAL)
}

function monitorComputerModel() {
    modelExtractor()
}

function init() {
    //monitorGeoLocation()
    monitorComputerModel()
}


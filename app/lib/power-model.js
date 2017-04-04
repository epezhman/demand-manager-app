'use strict'

module.exports = {
    powerNormalEstimate,
    powerSaveEstimate,
    tryLoadingPowerModelFileAgain
}

const fs = require('fs')
const electron = require('electron')
const app = electron.app
const log = require('./log')
const math = require('mathjs')
const config = require('../config')
const reload = require('require-reload')(require)

let powerModelCal = null
try {
    powerModelCal =
        reload(`${app.getPath('userData')}${config.POWER_MODEL_FILE_BASE_DIR}/${config.POWER_MODEL_FILE_NAME}`)
} catch (err) {
    log.sendError(err)
}

function powerNormalEstimate(systemMetrics) {
    if (powerModelCal) {
        log(powerModelCal.powerNormalEstimate(systemMetrics, math))
    }
    return 0
}

function powerSaveEstimate(systemMetrics) {
    if (powerModelCal) {
        log(powerModelCal.powerNormalEstimate(systemMetrics, math))
    }
    return 0
}

function tryLoadingPowerModelFileAgain() {
    try {
        log('Power reload')
        powerModelCal =
            reload(`${app.getPath('userData')}${config.POWER_MODEL_FILE_BASE_DIR}/${config.POWER_MODEL_FILE_NAME}`)
    } catch (err) {
        log.sendError(err)
    }
}

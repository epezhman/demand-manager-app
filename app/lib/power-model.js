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

const powerModelFilePath =
    `${app.getPath('userData')}${config.POWER_MODEL_FILE_BASE_DIR}/${config.POWER_MODEL_FILE_NAME}`
let powerModelCal = null

try {
    if (fs.existsSync(powerModelFilePath)) {
        powerModelCal = reload(powerModelFilePath)
    }
} catch (err) {
    log.sendError(err)
}

function powerNormalEstimate(systemMetrics) {
    if (powerModelCal) {
        return powerModelCal.powerNormalEstimate(systemMetrics, math)
    }
    return 0
}

function powerSaveEstimate(systemMetrics) {
    if (powerModelCal) {
        return powerModelCal.powerNormalEstimate(systemMetrics, math)
    }
    return 0
}

function tryLoadingPowerModelFileAgain() {
    try {
        if (fs.existsSync(powerModelFilePath)) {
            powerModelCal = reload(powerModelFilePath)
        }
    } catch (err) {
        log.sendError(err)
    }
}

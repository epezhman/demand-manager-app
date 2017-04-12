'use strict'

module.exports = {
    init,
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

let powerModelFilePath = null
let powerModelCal = null


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
        powerModelFilePath =
            `${app.getPath('userData')}${config.POWER_MODEL_FILE_BASE_DIR}/${config.POWER_MODEL_FILE_NAME}`
        if (fs.existsSync(powerModelFilePath)) {
            powerModelCal = reload(powerModelFilePath)
        }
    } catch (err) {
        log.sendError(err)
    }
}

function init() {
    tryLoadingPowerModelFileAgain()
}
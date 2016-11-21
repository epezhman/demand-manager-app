'use strict'

module.exports = {
    init,
    makeFirstCommandsSchedule,
    runCheckDM,
    startDM,
    stopDM,
    restoreBacklight
}

const config = require('../config')

const db = require('../main/windows').db
const log = require('./log')
const monitor = require('./monitor')

function makeFirstCommandsSchedule() {
    db.runQuery({
        'fn': 'addFirstSchedule',
        'params': []
    })
}

function runCheckDM() {
    if (monitor.shouldAppBeRunning()) {
        db.runQuery({
            'fn': 'runCheckDM',
            'params': []
        })
    }
    setTimeout(runCheckDM, config.RUN_DM_INTERVAL_CHECK)
}


function startDM() {
    if (config.IS_WINDOWS) {
        require('./windows-power-control').startDM()
    }
    else if (config.IS_LINUX) {
        require('./linux-power-control').startDM()
    }
}

function stopDM() {
    if (config.IS_WINDOWS) {
        require('./windows-power-control').stopDM()
    }
    else if (config.IS_LINUX) {
        require('./linux-power-control').stopDM()
    }
}

function restoreBacklight() {
    if (config.IS_LINUX) {
        require('./linux-power-control').restoreBacklight()
    }
}

function init() {
    runCheckDM()
}
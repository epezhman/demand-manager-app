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
const _ = require('lodash')
const moment = require('moment')

const db = require('../main/windows').db
const monitor = require('./monitor')
const enums = require('./enums')
const ConfigStore = require('configstore')

const conf = new ConfigStore(config.APP_SHORT_NAME)

function checkSchedulePeriod() {
    let schedule_period = conf.get('schedule-period')
    if (schedule_period && _.trim(String(schedule_period)).length) {
        for (let period of _.split(schedule_period, '|')) {
            period = _.trim(period)
            let tempSplit = _.split(period, '$')
            if (tempSplit.length === 2) {
                if (moment().isBetween(tempSplit[0], tempSplit[1])) {
                    return enums.DMCheck.RUN_DM
                }
            }
            else {
                return enums.DMCheck.CHECK_DB
            }
        }
        return enums.DMCheck.NOT_RUN_DM
    }
    return enums.DMCheck.CHECK_DB
}

function makeFirstCommandsSchedule() {
    db.runQuery({
        'fn': 'addFirstSchedule',
        'params': []
    })
}

function runCheckDM() {
    if (monitor.shouldAppBeRunning()) {
        let checkDM = checkSchedulePeriod()
        if (checkDM === enums.DMCheck.CHECK_DB) {
            db.runQuery({
                'fn': 'runCheckDM',
                'params': []
            })
        }
        else if (checkDM === enums.DMCheck.RUN_DM) {
            startDM()
        }
        else if (checkDM === enums.DMCheck.NOT_RUN_DM) {
            stopDM()
        }

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
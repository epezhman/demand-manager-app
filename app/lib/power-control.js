'use strict'


module.exports = {
    init,
    runCheckDM,
    startDM,
    stopDM,
    restoreBacklight,
    powerToggle
}


const config = require('../config')
const _ = require('lodash')
const moment = require('moment')

const monitor = require('./monitor')
const log = require('./log')
const enums = require('./enums')
const ConfigStore = require('configstore')

const conf = new ConfigStore(config.APP_SHORT_NAME)


function powerToggle() {
    if (!conf.get('power-save-on')) {
        if (config.IS_WINDOWS) {
            require('./windows-power-control').startDM()
        }
        else if (config.IS_LINUX) {
            require('./linux-power-control').startDM()
        }
        conf.set('power-save-on', true)
    }
    else {
        if (config.IS_WINDOWS) {
            require('./windows-power-control').stopDM()
        }
        else if (config.IS_LINUX) {
            require('./linux-power-control').stopDM()
        }
        conf.set('power-save-on', false)
    }
}

function checkSchedulePeriod() {
    let schedulePeriod = conf.get('schedule-period')
    if (schedulePeriod && _.trim(String(schedulePeriod)).length) {
        for (let period of _.split(schedulePeriod, '|')) {
            period = _.trim(period)
            // Specific Schedule e.g.: 2017-03-29T17:53:23+02:00$2017-03-29T18:55:23+02:00
            let tempSplitFullTime = _.split(period, '$')
            // Daily Schedule  e.g.:  17:53:23+02:00%18:55:23+02:00
            let tempSplitDaily = _.split(period, '%')
            // Weekly Schedule e.g.:  3W17:53:23+02:00#4W18:55:23+02:00 , Monday = 1 , Sunday = 7
            let tempSplitWeekly = _.split(period, '#')
            if (tempSplitFullTime.length === 2 || tempSplitWeekly.length === 2 || tempSplitDaily.length === 2) {
                if (tempSplitFullTime.length === 2 && moment().isBetween(tempSplitFullTime[0], tempSplitFullTime[1])) {
                    return enums.DMCheck.RUN_DM
                }
                if (tempSplitDaily.length === 2 && moment()
                        .isBetween(`${moment().format('YYYY-MM-DD')}T${tempSplitDaily[0]}`,
                            `${moment().format('YYYY-MM-DD')}T${tempSplitDaily[1]}`)) {
                    return enums.DMCheck.RUN_DM
                }
                if (tempSplitWeekly.length === 2) {
                    let time1 =_.split(tempSplitWeekly[0], 'W')
                    let time2 = _.split(tempSplitWeekly[1], 'W')
                    let day1 = parseInt(time1[0])
                    let day2 = parseInt(time2[0])
                    if (moment().isBetween(`${moment().day(day1).format('YYYY-MM-DD')}T${time1[1]}`,
                            `${moment().day(day2).format('YYYY-MM-DD')}T${time2[1]}`)) {
                        return enums.DMCheck.RUN_DM
                    }
                }
            }
            else {
                return enums.DMCheck.NOT_SCHEDULE
            }
        }
        return enums.DMCheck.NOT_RUN_DM
    }
}

function runCheckDM() {
    if (monitor.shouldAppBeRunning()) {
        let checkDM = checkSchedulePeriod()
        if (checkDM === enums.DMCheck.RUN_DM) {
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
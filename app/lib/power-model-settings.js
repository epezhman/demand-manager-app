'use strict'

module.exports = {
    init,
    updatePowerModelCoef
}

const _ = require('lodash')
const ConfigStore = require('configstore')
const config = require('../config')
const conf = new ConfigStore(config.APP_SHORT_NAME)


function init() {
    conf.set('intercept', 15)
    conf.set('remaining_time_coef', 0)
    conf.set('power_rate_coef', 2)
    conf.set('remaining_capacity_coef', 0)
    conf.set('voltage_coef', 0)
    conf.set('charging_coef', 0)
    conf.set('discharging_coef', 0)
    conf.set('ac_connected_coef', 0)
    conf.set('brightness_coef', 0)
    conf.set('memory_percent_coef', 0)
    conf.set('memory_mb_coef', 0)
    conf.set('read_request_per_s_coef', 0)
    conf.set('read_kb_per_s_coef', 0)
    conf.set('write_request_per_s_coef', 0)
    conf.set('write_kb_per_s_coef', 0)
    conf.set('cpu_usage_percent_coef', 0)
    conf.set('cpu_cores_coef', 0)
    conf.set('download_kb_coef', 0)
    conf.set('upload_kb_coef', 0)
    conf.set('wifi_coef', 0)
    conf.set('internet_connected_coef', 0)
    conf.set('power_save_coef', 0.8)
}

function updatePowerModelCoef() {
    let powerModel = conf.get('power-model')
    if (powerModel && _.trim(String(powerModel)).length) {
        for (let coef of _.split(powerModel, '|')) {
            coef = _.trim(coef)
            let tempSplit = _.split(coef, '$')
            if (tempSplit.length === 2) {
                conf.set(tempSplit[0], parseFloat(tempSplit[1]))
            }
        }
    }
}
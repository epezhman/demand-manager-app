'use strict'

module.exports = {
    powerNormalEstimate,
    powerSaveEstimate
}

const ConfigStore = require('configstore')

const config = require('../config')

const conf = new ConfigStore(config.APP_SHORT_NAME)


function powerNormalEstimate(systemMetrics) {
    return conf.get('intercept') +
        conf.get('remaining_time_coef') * systemMetrics['remaining_time_minutes'] +
        conf.get('power_rate_coef') * systemMetrics['power_rate_w'] +
        conf.get('remaining_capacity_coef') * systemMetrics['remaining_capacity_percent'] +
        conf.get('voltage_coef') * systemMetrics['voltage_v'] +
        conf.get('charging_coef') * systemMetrics['charging_bool'] +
        conf.get('discharging_coef') * systemMetrics['discharging_bool'] +
        conf.get('ac_connected_coef') * systemMetrics['ac_connected_bool'] +
        conf.get('brightness_coef') * systemMetrics['brightness_percent'] +
        conf.get('memory_percent_coef') * systemMetrics['memory_percent'] +
        conf.get('memory_mb_coef') * systemMetrics['memory_mb'] +
        conf.get('read_request_per_s_coef') * systemMetrics['read_request_per_s'] +
        conf.get('read_kb_per_s_coef') * systemMetrics['read_kb_per_s'] +
        conf.get('write_request_per_s_coef') * systemMetrics['write_request_per_s'] +
        conf.get('write_kb_per_s_coef') * systemMetrics['write_kb_per_s'] +
        conf.get('cpu_usage_percent_coef') * systemMetrics['cpu_usage_percent'] +
        conf.get('cpu_cores_coef') * systemMetrics['cpu_cores'] +
        conf.get('download_kb_coef') * systemMetrics['download_kb'] +
        conf.get('upload_kb_coef') * systemMetrics['upload_kb'] +
        conf.get('wifi_coef') * systemMetrics['wifi'] +
        conf.get('internet_connected_coef') * systemMetrics['internet_connected'];
}

function powerSaveEstimate(systemMetrics) {
    return conf.get('power_save_coef') * powerNormalEstimate(systemMetrics)
}
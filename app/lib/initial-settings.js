'use strict'

module.exports = {
    init
}

const ConfigStore = require('configstore')
const config = require('../config')
const conf = new ConfigStore(config.APP_SHORT_NAME)

function init() {
    conf.set('dim-screen', true)
    conf.set('turn-off-screen', true)
    conf.set('suspend-computer', false)

    conf.set('power-model', 'NA')
    conf.set('schedule-period', 'NA')
    conf.set('logging-enabled', false)
    conf.set('days-delete-db', config.DAYS_TO_DELETE_DB)
    conf.set('power-monitor-interval', config.MONITOR_POWER_INTERVAL)
}

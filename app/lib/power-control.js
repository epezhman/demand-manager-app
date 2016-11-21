'use strict'

module.exports = powerToggle

const ConfigStore = require('configstore')

const config = require('../config')

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
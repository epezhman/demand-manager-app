'use strict'

module.exports = {
    init
}

const AutoLaunch = require('auto-launch')
const ConfigStore = require('configstore')

const config = require('../config')

const conf = new ConfigStore(config.APP_SHORT_NAME)

var appLauncher = new AutoLaunch({
    name: config.APP_NAME,
    isHidden: true
})

function init() {
    if (!conf.get('run-on-start-up')) {
        appLauncher.isEnabled().then((enabled) => {
            conf.set('run-on-start-up', true)
            if (enabled) {
                return
            }
            return appLauncher.enable()
        })
    }
    else
    {
        appLauncher.isEnabled().then((enabled) => {
            if (enabled) {
                appLauncher.disable()
                return appLauncher.enable()
            }
        })
    }
}
'use strict'

module.exports = {
    init
}

const AutoLaunch = require('auto-launch')
const storage = require('electron-json-storage')

const config = require('../config')

function init() {
    storage.has('run-on-start-up', (error, hasKey) => {
        if (!hasKey) {
            var appLauncher = new AutoLaunch({
                name: config.APP_NAME
            })
            appLauncher.isEnabled().then((enabled) => {
                if (enabled) {
                    return
                }
                return appLauncher.enable()
            })
            storage.set('run-on-start-up', {run: true}, (error) => {
            })
        }
    })
}
'use strict'

module.exports = notify

const config = require('../config')
const windows = require('../main/windows')

function notify(msg) {

    if (config.IS_WINDOWS || config.IS_LINUX) {
        windows.notify.init(msg)
    }
    else {
        const notifier = require('node-notifier')
        notifier.notify({
            title: config.APP_NAME,
            message: msg,
            icon: config.APP_ICON
        })
    }
}
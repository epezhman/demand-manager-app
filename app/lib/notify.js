'use strict'

module.exports = notify

const notifier = require('node-notifier')
const config = require('../config')
const windows = require('../main/windows')

function notify(msg) {

    if (process.platform === 'win32') {
        windows.notify.init(msg)
    }
    else {
        notifier.notify({
            title: config.APP_NAME,
            message: msg,
            icon: config.APP_ICON
        })
    }
}
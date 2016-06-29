'use strict'

module.exports = notify

const notifier = require('node-notifier')
const config = require('../config')

function notify(msg) {
    notifier.notify({
        title: config.APP_NAME,
        message: msg,
        icon: config.APP_ICON
    });
}
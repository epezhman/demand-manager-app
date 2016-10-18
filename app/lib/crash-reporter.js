'use strict'

module.exports = {
    init
}

var config = require('../config')
var electron = require('electron')

function init(extra) {
    electron.crashReporter.start({
        companyName: config.APP_TEAM,
        productName: config.APP_NAME,
        submitURL: config.CRASH_REPORT_URL,
        autoSubmit: true,
        extra: extra
    })
}

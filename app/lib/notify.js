'use strict'

module.exports = notify

const config = require('../config')
const windows = require('../main/windows')

function notify(msg) {
    windows.notify.init(msg)
}
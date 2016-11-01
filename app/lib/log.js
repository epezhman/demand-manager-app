'use strict'

module.exports = log
module.exports.error = error

const windows = require('../main/windows')
const config = require('../config')

function log(...args) {
    windows.main.logMessage(...args)
    if (config.IS_DEVELOPMENT) {
        console.log('LOG: ', ...args)
    }
    else {
        windows.main.logMessage(...args)
    }

}

function error(...args) {
    if (config.IS_DEVELOPMENT) {
        console.error('ERROR: ', ...args)
    }
    else {
        windows.main.logErrorMessage(...args)
    }
}

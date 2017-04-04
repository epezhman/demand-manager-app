'use strict'

module.exports = log
module.exports.error = error
module.exports.sendError = sendError

const windows = require('../main/windows')
const config = require('../config')
const request = require('request')

function log(...args) {
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

function sendError(err) {
    let tempId = global.machineId ? global.machineId : 'NoId'
    let errorString = JSON.stringify(err, ['message', 'arguments', 'type', 'name', 'fileName', 'lineNumber', 'stack'])
    /* jshint ignore:start */
    request.post(config.EXCEPTION_REPORT_URL, {form: {device_id: tempId, error: errorString}}, (err, res, data) => {
        if (err) {
            error(res)
            error(data)
        }
    })
    /* jshint ignore:end */

    if (config.IS_DEVELOPMENT) {
        error(err)
    }
}
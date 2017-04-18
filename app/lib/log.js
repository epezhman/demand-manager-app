'use strict'

module.exports = log
module.exports.error = error
module.exports.sendError = sendError
module.exports.loggingV = loggingV

const windows = require('../main/windows')
const config = require('../config')
const request = require('request')
const logElectron = require('electron-log');

logElectron.transports.console.level = false;

function log(...args) {
    if (config.IS_DEVELOPMENT) {
        console.log('LOG: ', ...args)
    }
    else {
        windows.main.logMessage(...args)
    }
}

function loggingV(...args) {
    if(config.IS_V_LOGGING)
    {
        logElectron.warn(args);
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
    logElectron.error(err);
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
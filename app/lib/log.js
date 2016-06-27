'use strict'

module.exports = log
module.exports.error = error

const {app} = require('electron')

function log(...args) {
    console.log('LOG: ', ...args)
}

function error(...args) {
    console.error('ERROR: ', ...args)
}

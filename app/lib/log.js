'use strict'

module.exports = log
module.exports.error = error

const {app} = require('electron')

function log(...args) {
    console.log('log', ...args)
}

function error(...args) {
    console.error('log', ...args)

}

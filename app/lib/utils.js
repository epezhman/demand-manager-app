'use strict'

module.exports = {
    convertWmicStringToList
}

const _ = require('lodash/string')
const log = require('./log')

function convertWmicStringToList(str) {
    if (str.includes(`\r\r`)) {
        return _.split(str.replace(/\r\r/g, ','), /[, ]+/g)
    }
    return str
}
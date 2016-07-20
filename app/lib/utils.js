'use strict'

module.exports = {
    convertWmicStringToList,
    standardizeForFirebase
}

const _ = require('lodash/string')
const log = require('./log')

function convertWmicStringToList(str) {
    if (str.includes(`\r\r`)) {
        return _.split(str.replace(/\r\r/g, ','), /[, ]+/g)
    }
    return str
}


function standardizeForFirebase(jsonStr) {
    return JSON.parse(jsonStr, (key, value)=> {
        if (value && typeof value === 'object')
            for (var k in value) {
                if (k.includes('.') && Object.hasOwnProperty.call(value, k)) {
                    value[k.replace(/\./g, ',')] = value[k];
                    delete value[k];
                }
            }
        return value;
    })
}
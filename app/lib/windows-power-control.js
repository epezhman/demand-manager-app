'use strict'

module.exports = {
    startDM,
    stopDM
}

const fr = require('@paulcbetts/system-idle-time')
const log = require('./log')

function startDM() {
    log('start DM')
    log(fr.getIdleTime())
}

function stopDM() {
    log('stop DM')
    log(fr.getIdleTime())
}
'use strict'

module.exports = {
    startDM,
    stopDM
}

const log = require('./log')
const fr = require('@paulcbetts/system-idle-time')

function startDM() {
    log('start DM')
    log(fr.getIdleTime())
}

function stopDM() {
    log('stop DM')
    log(fr.getIdleTime())


}
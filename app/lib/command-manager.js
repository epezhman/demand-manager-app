'use strict'

module.exports = {
    makeFirstCommandsSchedule,
}


const db = require('../main/windows').db
const log = require('./log')


function makeFirstCommandsSchedule() {
    db.runQuery({
        'fn': 'addFirstSchedule',
        'params': []
    })
}
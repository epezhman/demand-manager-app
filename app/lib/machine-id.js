'use strict'

module.exports = {
    init
}

const storage = require('electron-json-storage')
const config = require('../config')
const firebase = require('./firebase')

function init() {
    storage.has('machine-uuid', (error, hasKey) => {
        if (!hasKey) {
            var tempId = require('node-uuid').v1()
            storage.set('machine-uuid', {uuid: tempId}, (error) => {
                global.machineId = tempId
                firebase.registerDevice(tempId)
            })
        }
        storage.get('machine-uuid', (error, data)=> {
            global.machineId = data.uuid
        })
    })
}

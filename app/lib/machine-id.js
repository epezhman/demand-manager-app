'use strict'

module.exports = {
    init,
    getMachineId
}

const storage = require('electron-json-storage')

const config = require('../config')

var machine_id

function init() {
    storage.has('machine-uuid', (error, hasKey) => {
        if (!hasKey) {
            storage.set('machine-uuid', {uuid: require('node-uuid').v1()}, (error) => {
            })
        }
        storage.get('machine-uuid', (error, data)=> {
            machine_id = data.uuid
        })
    })
}
function getMachineId(){
    return machine_id
}
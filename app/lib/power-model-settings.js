'use strict'

module.exports = {
    updatePowerModelFile
}
const electron = require('electron')
const app = electron.app
const ConfigStore = require('configstore')
const config = require('../config')
const powerModel = require('./power-model')
const mkdirp = require('mkdirp')
const https = require('https')
const fs = require('fs')
const log = require('./log')

const conf = new ConfigStore(config.APP_SHORT_NAME)


function updatePowerModelFile() {
    mkdirp.sync(`${app.getPath('userData')}${config.POWER_MODEL_FILE_BASE_DIR}`)
    let powerFile = fs.createWriteStream(
        `${app.getPath('userData')}${config.POWER_MODEL_FILE_BASE_DIR}/${config.POWER_MODEL_FILE_NAME}`)
    https.get(conf.get('power-model-url'), (response) => {
        response.pipe(powerFile).on('close', () => {
            powerModel.tryLoadingPowerModelFileAgain()
        })
    })
}
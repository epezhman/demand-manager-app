'use strict'

module.exports = {
    init
}

const ConfigStore = require('configstore')
const config = require('../config')
const conf = new ConfigStore(config.APP_SHORT_NAME)

function init() {
    conf.set('dim-screen', true)
    conf.set('turn-off-screen', true)
    conf.set('suspend-computer', false)
}

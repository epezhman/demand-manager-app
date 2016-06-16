'use strict'

const Q = require('q')
const builder = require('electron-builder')
const Platform = builder.Platform
const utils = require('../utils')

var init = () => {
    return new Q()
}

var buildOSX = () => {
    utils.log('Building OSX 64-bit')
    return builder.build({
        targets: Platform.OSX.createTarget()
    })
}


module.exports = () => {
    return init()
        .then(buildOSX)
        .catch(console.error)
}
'use strict'

const Q = require('q')
const builder = require('electron-builder')
const Platform = builder.Platform
const Arch = builder.Arch
const utils = require('../utils')

var init = () => {
    return new Q()
}

var buildLinux32 = () => {
    utils.log('Building Linux 32-bit')
    return builder.build({
        targets: Platform.LINUX.createTarget(null, Arch.ia32)
    })
}

var buildLinux64 = () => {
    utils.log('Building Linux 64-bit')
    return builder.build({
        targets: Platform.LINUX.createTarget(null, Arch.x64)
    })
}

module.exports = () => {
    return init()
        .then(buildLinux64)
        .then(buildLinux32)
        .catch(console.error)
}
'use strict'

const Q = require('q')
const builder = require('electron-builder')
const Platform = builder.Platform
const Arch = builder.Arch
const utils = require('../utils')

var init = () => {
    return new Q()
}

var buildWin32 = () => {
    utils.log('Building Windows 32-bit')
    return builder.build({
        targets: Platform.WINDOWS.createTarget(null, Arch.ia32)
    })
}

var buildWin64 = () => {
    utils.log('Building Windows 64-bit')
    return builder.build({
        targets: Platform.WINDOWS.createTarget(null, Arch.x64),
        devMetadata: {
            'build': {
                'win': {
                    'remoteReleases': 'https://github.com/epezhman/demand-manager-app'
                }
            }
        }
    })
}

module.exports = () => {
    return init()
        .then(buildWin64)
        .then(buildWin32)
        .catch(console.error)
}
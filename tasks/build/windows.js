'use strict'

const gutil = require('gulp-util')
const Q = require('q')
const builder = require('electron-builder')
const Platform = builder.Platform
const Arch = builder.Arch

var init = () => {
    return new Q()
}

var buildWin32 = () => {
    gutil.log(gutil.colors.blue('Building Windows 32-bit'))
    return builder.build({
        targets: Platform.WINDOWS.createTarget(null, Arch.ia32)
    })
}

var buildWin64 = () => {
    gutil.log(gutil.colors.blue('Building Windows 64-bit'))
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
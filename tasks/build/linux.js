'use strict'

const gutil = require('gulp-util')
const Q = require('q')
const builder = require('electron-builder')
const Platform = builder.Platform
const Arch = builder.Arch

var init = () => {
    return new Q()
}

var buildLinux32 = () => {
    gutil.log(gutil.colors.blue('Building Linux 32-bit'))
    return builder.build({
        targets: Platform.LINUX.createTarget(null, Arch.ia32)
    })
}

var buildLinux64 = () => {
    gutil.log(gutil.colors.blue('Building Linux 64-bit'))
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
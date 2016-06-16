'use strict'

const gutil = require('gulp-util')
const Q = require('q')
const builder = require('electron-builder')
const Platform = builder.Platform

var init = () => {
    return new Q()
}

var buildOSX = () => {
    gutil.log(gutil.colors.blue('Building OSX 64-bit'))
    return builder.build({
        targets: Platform.OSX.createTarget()
    })
}


module.exports = () => {
    return init()
        .then(buildOSX)
        .catch(console.error)
}
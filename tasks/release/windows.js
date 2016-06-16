'use strict'

const gutil = require('gulp-util')
const Q = require('q')


var init = () => {
    return new Q()
}

var releaseWin32 = () => {
    gutil.log(gutil.colors.blue('Releasing Windows 32-bit'))

}

var releaseWin64 = () => {
    gutil.log(gutil.colors.blue('Releasing Windows 64-bit'))

}

module.exports = () => {
    return init()
        .then(releaseWin64)
        .then(releaseWin32)
        .catch(console.error)
}
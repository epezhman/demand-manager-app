'use strict'

const gulp = require('gulp')

const utils = require('../utils')


var releaseForOs = {
    osx: require('./osx'),
    linux: require('./linux'),
    windows: require('./windows')
}

gulp.task('release', () => {
    return releaseForOs[utils.os()]()
})
